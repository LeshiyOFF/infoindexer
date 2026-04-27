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
import type { CompanyMergerService } from './repositories/company-merger.service';
import type { ExternalEnrichmentService } from './services/external-enrichment.service';
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
export declare class EgrulSyncService {
    private readonly httpClient;
    private readonly repository;
    private readonly parser;
    private readonly identityMapping;
    private readonly denormalization;
    private readonly merger;
    private readonly resumeStorage?;
    private readonly flusher;
    private readonly tracker;
    private readonly errorHandler;
    private readonly orchestrator;
    private readonly stagingSync;
    private currentDumpUrl;
    constructor(httpClient: FTMHttpClient, repository: ClickHouseRepository, parser: EntityParserService, stagingStorage: IStagingStoragePort, stagingSync: StagingSyncService, syncStateStorage: ISyncStateStoragePort, progressReporter: ProgressReporter, identityMapping: IdentityMappingService, denormalization: DenormalizationService, merger: CompanyMergerService, enrichment?: ExternalEnrichmentService, resumeStorage?: IResumeStateStorage | undefined);
    /**
     * Выполняет полную синхронизацию EGRUL данных
     *
     * @remarks
     * Staging Flow: Parse → Staging → Transform → Production → MV
     */
    run(options?: EgrulSyncOptions): Promise<void>;
    /**
     * Добавляет распаршенную сущность в соответствующий батч
     *
     * @remarks
     * Staging Pattern: Direct insert to production, relationships to staging.
     */
    private addToBatch;
    private reportProgress;
    /**
     * Обрабатывает abort синхронизации
     */
    private handleAbort;
}
