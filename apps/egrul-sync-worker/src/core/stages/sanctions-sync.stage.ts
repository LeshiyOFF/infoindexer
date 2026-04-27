/**
 * Sanctions Sync Stage
 *
 * Загрузка и парсинг санкций из OpenSanctions API.
 */

import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { CircuitBreaker } from '../infrastructure/circuit-breaker';
import type { RetryPolicy } from '../infrastructure/retry';
import { SyncStage } from 'shared';
import type { ISanctionRepository } from 'shared/repositories';
import type { SanctionRow } from 'shared/repositories';
import type { SanctionParserService } from '../parsers/sanction-parser.service';
import type { FTMHttpClient } from '../infrastructure/http-client';
import { BaseSyncStage } from './sync-stage';
import type { StageContext, StageMetadata, StageOptions, StageResult } from './stage-context';
import { stageSuccess, stageFailure } from './stage-context';

/**
 * Источник данных о санкциях
 */
interface SanctionSource {
  readonly id: string;
  readonly inn: string;
  readonly program: string;
  readonly program_id: string;
  readonly authority: string;
  readonly country: string;
  readonly start_date: string;
  readonly end_date: string | null;
  readonly source_url: string;
}

/**
 * Конфигурация sanctions sync
 */
interface SanctionsSyncConfig {
  readonly apiUrl: string;
  readonly batchSize: number;
  readonly timeout: number;
  readonly abortSignal?: AbortSignal;
}

/**
 * Ответ API OpenSanctions
 */
interface SanctionsApiResponse {
  readonly results?: SanctionSource[];
  readonly next?: number | null;
}

/**
 * Stage для загрузки санкций
 */
export class SanctionsSyncStage extends BaseSyncStage {
  private readonly config: SanctionsSyncConfig;

  constructor(
    context: StageContext,
    private readonly repository: ISanctionRepository,
    private readonly parser: SanctionParserService,
    private readonly httpClient: FTMHttpClient,
    sanctionsConfig?: Partial<SanctionsSyncConfig>
  ) {
    super(context);
    this.config = {
      apiUrl: sanctionsConfig?.apiUrl ?? 'https://api.opensanctions.org/api/search',
      batchSize: sanctionsConfig?.batchSize ?? 100,
      timeout: sanctionsConfig?.timeout ?? 30000,
      abortSignal: sanctionsConfig?.abortSignal
    };
  }

  /**
   * Выполняет загрузку и парсинг санкций
   */
  protected async runInternal(options: StageOptions): Promise<StageResult> {
    let totalProcessed = 0;
    let totalErrors = 0;

    try {
      const { items } = await this.fetchSanctionsPage(1);

      if (items.length === 0) {
        return stageSuccess(0, 'Нет санкций для загрузки');
      }

      const { processed, errors } = await this.processBatch(items, options);
      totalProcessed = processed;
      totalErrors = errors;

      options.onProgress?.(100, `Загружено ${totalProcessed} записей`);

      return stageSuccess(
        totalProcessed,
        `Загружено ${totalProcessed} санкций${totalErrors > 0 ? `, ${totalErrors} ошибок` : ''}`
      );

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return stageFailure(message, 'SANCTIONS_SYNC_FAILED');
    }
  }

  /**
   * Возвращает метаданные stage
   */
  protected getMetadata(): StageMetadata {
    return {
      name: 'Загрузка санкций',
      stage: SyncStage.SANCTIONS_DOWNLOAD,
      startPercentage: 25,
      endPercentage: 40
    };
  }

  /**
   * Загружает страницу санкций из API
   */
  private async fetchSanctionsPage(page: number): Promise<{
    items: SanctionSource[];
  }> {
    const response = await this.executeWithResilience(
      () => this.httpClient.fetch(`${this.config.apiUrl}?page=${page}&limit=${this.config.batchSize}`, false),
      'fetch_sanctions'
    );

    const data = await response.data.json() as SanctionsApiResponse;

    return {
      items: data.results ?? []
    };
  }

  /**
   * Обрабатывает батч санкций
   */
  private async processBatch(
    items: SanctionSource[],
    options: StageOptions
  ): Promise<{ processed: number; errors: number }> {
    const parsedRows: SanctionRow[] = [];
    let errors = 0;

    for (const item of items) {
      // Проверяем abort при обработке каждой записи
      if (this.config.abortSignal?.aborted) {
        throw new Error('Sanctions sync aborted');
      }

      const result = this.parser.parse(item);

      if (result.isOk()) {
        parsedRows.push(result.unwrap());
      } else {
        errors++;
        if (!options.skipErrors) {
          result.match({
            ok: () => {},
            err: (err) => { throw err; }
          });
        }
      }
    }

    if (parsedRows.length > 0) {
      await this.repository.saveBatch(parsedRows);
    }

    return {
      processed: parsedRows.length,
      errors
    };
  }
}

/**
 * Фабрика для создания SanctionsSyncStage
 */
export function createSanctionsSyncStage(
  reporter: ProgressReporter,
  circuitBreaker: CircuitBreaker,
  retryPolicy: RetryPolicy,
  repository: ISanctionRepository,
  parser: SanctionParserService,
  httpClient: FTMHttpClient,
  sanctionsConfig?: Partial<SanctionsSyncConfig>
): SanctionsSyncStage {
  const context: StageContext = {
    reporter,
    circuitBreaker,
    retryPolicy,
    startTime: new Date()
  };

  return new SanctionsSyncStage(
    context,
    repository,
    parser,
    httpClient,
    sanctionsConfig
  );
}
