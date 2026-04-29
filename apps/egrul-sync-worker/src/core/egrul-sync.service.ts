/**
 * Service: EGRUL Sync
 *
 * @remarks
 * Основной сервис синхронизации. Делегирует выполнение этапов SyncOrchestrator.
 * Поддерживает HTTP Range resume для прерванных загрузок.
 *
 * Staging + Transform Pattern:
 * - Raw FTM entities → Staging tables
 * - Transform service → Production tables
 * - MV auto-aggregation → Read views
 *
 * Memory reduced 28x: 5.6GB → ~200MB.
 */
import readline from 'readline';
import type { ProgressReporter } from './infrastructure/progress-reporter';
import type { FTMHttpClient } from './infrastructure/http-client';
import type { StagingSyncService } from './services/staging-sync.service';
import type { EntityParserService } from './entity-parser.service';
import type { IResumeStateStorage } from './ports';
import type { IStagingStoragePort } from './domain/ports';
import type { ISyncStateStoragePort } from './ports/i-sync-state-storage.port';
import type { ClickHouseRepository } from './repositories/clickhouse.repository';
import type { IdentityMappingService } from './repositories/identity-mapping.service';
import type { DenormalizationService } from './services/denormalization.service';
import type { ExternalEnrichmentService } from './services/external-enrichment.service';
import { DEFAULT_BATCH_SIZE } from '../config/constants';
import type {
  EgrulCompanyRow,
  StagingCompanyRow,
  StagingDirectorshipRow,
  StagingOwnershipRow
} from './domain/entities';
import { BatchFlusher, createEmptyBatchState, type BatchState } from './services/batch-flusher.service';
import { StreamTracker } from './services/stream-tracker.service';
import { SyncErrorHandler } from './services/sync-error-handler.service';
import { createSyncOrchestrator } from './services/sync-orchestrator.factory';
import { SyncOrchestrator } from './services/sync-orchestrator.service';

/**
 * Опции для запуска синхронизации
 */
export interface EgrulSyncOptions {
  enableEnrichment?: boolean;
  useResume?: boolean;
  abortSignal?: AbortSignal;
  forceFullSync?: boolean;
}

/**
 * Основной сервис синхронизации EGRUL данных
 *
 * @remarks
 * Staging + Transform Pattern:
 * - Parse → Staging tables (raw FTM data)
 * - Transform → Production tables (resolved IDs)
 * - MV auto-aggregation → Read views
 */
export class EgrulSyncService {
  private readonly flusher: BatchFlusher;
  private readonly tracker: StreamTracker;
  private readonly errorHandler: SyncErrorHandler;
  private readonly orchestrator: SyncOrchestrator;
  private readonly stagingSync: StagingSyncService;
  private currentDumpUrl: string | null = null;

  constructor(
    private readonly httpClient: FTMHttpClient,
    private readonly repository: ClickHouseRepository,
    private readonly parser: EntityParserService,
    stagingStorage: IStagingStoragePort,
    stagingSync: StagingSyncService,
    syncStateStorage: ISyncStateStoragePort,
    progressReporter: ProgressReporter,
    private readonly identityMapping: IdentityMappingService,
    private readonly denormalization: DenormalizationService,
    enrichment?: ExternalEnrichmentService,
    private readonly resumeStorage?: IResumeStateStorage
  ) {
    this.flusher = new BatchFlusher(stagingStorage);
    this.stagingSync = stagingSync;
    this.tracker = new StreamTracker(progressReporter);
    this.errorHandler = new SyncErrorHandler(progressReporter);

    this.orchestrator = createSyncOrchestrator({
      identityMapping,
      denormalization,
      repository,
      syncStateStorage,
      progressReporter,
      enrichment
    });
  }

  /**
   * Выполняет полную синхронизацию EGRUL данных
   *
   * @remarks
   * Staging Flow: Parse → Staging → Transform → Production → MV
   */
  async run(options: EgrulSyncOptions = {}): Promise<void> {
    const { enableEnrichment = false, useResume = true, abortSignal, forceFullSync = false } = options;
    const state = createEmptyBatchState();

    let processedRecords = 0;
    let totalLinesScanned = 0;

    try {
      this.reportProgress('running', 0, 'Инициализация синхронизации...');

      const dumpUrl = await this.httpClient.fetchDownloadUrl();
      this.currentDumpUrl = dumpUrl;
      console.log(`Found FTM download URL: ${dumpUrl}`);

      this.reportProgress('running', 1, 'Загрузка данных OpenSanctions началась...');

      const response = (useResume && this.resumeStorage)
        ? await this.httpClient.fetchStreamWithResume(dumpUrl)
        : await this.httpClient.fetchStream(dumpUrl);

      const rl = readline.createInterface({
        input: response.data,
        crlfDelay: Infinity
      });

      for await (const line of rl) {
        if (abortSignal?.aborted) {
          await this.handleAbort(state);
          throw new Error('EGRUL sync aborted');
        }

        if (!line.trim()) continue;

        totalLinesScanned++;
        await this.tracker.handleLine(totalLinesScanned);

        if (totalLinesScanned === 1 || totalLinesScanned % 100000 === 0) {
          console.log(`[PROGRESS] Line ${totalLinesScanned}: length=${line.length}`);
        }

        try {
          const entity = JSON.parse(line);
          const parsed = this.parser.parseEntity(entity);
          if (!parsed) continue;

          this.addToBatch(state, parsed);

          if (this.parser.isCompanyRow(parsed)) {
            processedRecords++;
            if (processedRecords === 1) {
              console.log('[DIAG] First company row:', JSON.stringify(parsed, null, 2));
            }
          }

          await this.flusher.flushBatchesIfNeeded(state, DEFAULT_BATCH_SIZE);
        } catch (e) {
          console.error(`[ERROR] Parse error at line ${totalLinesScanned}:`, e);
        }
      }

      await this.flusher.flushAllBatches(state);

      await this.orchestrator.executeAll({
        forceFullSync,
        enableEnrichment,
        processedRecords
      });

      if (this.currentDumpUrl && this.resumeStorage) {
        await this.resumeStorage.clear(this.currentDumpUrl);
      }

      this.reportProgress(
        'completed',
        100,
        `Успешно: загружено ${processedRecords.toLocaleString()} компаний`
      );

      console.log('EGRUL (OpenSanctions) sync completed!');
    } catch (error) {
      await this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.currentDumpUrl = null;
    }
  }

  /**
   * Добавляет распаршенную сущность в соответствующий батч
   *
   * @remarks
   * Staging Pattern: Direct insert to production, relationships to staging.
   */
  private addToBatch(
    state: BatchState,
    parsed: EgrulCompanyRow | StagingCompanyRow | StagingDirectorshipRow | StagingOwnershipRow
  ): void {
    if (this.parser.isCompanyRow(parsed)) {
      state.companies.push(parsed);
    } else if (this.parser.isStagingCompanyRow(parsed)) {
      state.stagingCompanies.push(parsed);
    } else if (this.parser.isStagingDirectorshipRow(parsed)) {
      state.directorships.push(parsed as StagingDirectorshipRow);
    } else if (this.parser.isStagingOwnershipRow(parsed)) {
      state.ownerships.push(parsed as StagingOwnershipRow);
    }
  }

  private reportProgress(status: string, percentage: number, message: string): void {
    console.log(`[${status.toUpperCase()}] ${percentage}% - ${message}`);
  }

  /**
   * Обрабатывает abort синхронизации
   */
  private async handleAbort(state: BatchState): Promise<void> {
    console.log('Handling EGRUL sync abort...');

    this.reportProgress('deleting', 0, 'Удаление частично загруженных данных...');

    await this.repository.clearPartialData();
    await this.stagingSync.clearStaging();

    if (this.currentDumpUrl && this.resumeStorage) {
      await this.resumeStorage.clear(this.currentDumpUrl);
    }

    this.reportProgress('idle', 0, 'Операция отменена');
    console.log('EGRUL sync abort handled');
  }
}
