import type { ClickHouseClient } from '@clickhouse/client';
import { redisSub } from 'shared';
import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { DaDataAdapter } from '../adapters/dadata-adapter';
import type { FuzzyMatcherService } from '../services/fuzzy-matcher.service';
import type { ExternalEnrichmentService } from '../services/external-enrichment.service';

/**
 * Worker для фонового обогащения данных
 * Работает независимо от основного процесса синхронизации
 */
export class EnrichmentWorker {
  private isRunning = false;

  constructor(
    private readonly enrichment: ExternalEnrichmentService,
    private readonly progress: ProgressReporter,
    private readonly redisChannel = 'sync:enrichment:start'
  ) {}

  /**
   * Запускает worker
   */
  start(): void {
    if (this.isRunning) {
      console.log('EnrichmentWorker already running');
      return;
    }

    this.isRunning = true;
    this.subscribe();
    console.log(`EnrichmentWorker started, listening on [${this.redisChannel}]`);
  }

  /**
   * Останавливает worker
   */
  stop(): void {
    this.isRunning = false;
    console.log('EnrichmentWorker stopped');
  }

  /**
   * Подписывается на Redis канал
   */
  private subscribe(): void {
    redisSub.subscribe(this.redisChannel, (err: unknown) => {
      if (err) {
        console.error(`Failed to subscribe to ${this.redisChannel}:`, err);
      } else {
        console.log(`EnrichmentWorker: Subscribed to channel [${this.redisChannel}]`);
      }
    });

    redisSub.on('message', async (channel: string, message: string) => {
      if (channel === this.redisChannel && this.isRunning) {
        console.log(`EnrichmentWorker received command: [${message}]`);

        try {
          await this.execute();
        } catch (error) {
          console.error('EnrichmentWorker error:', error);

          await this.progress.report({
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            message: `Ошибка обогащения: ${error}`,
            updated_at: new Date().toISOString()
          });
        }
      }
    });
  }

  /**
   * Выполняет enrichment
   */
  private async execute(): Promise<void> {
    const startTime = Date.now();

    await this.progress.report({
      status: 'running',
      percentage: 0,
      message: 'Запуск обогащения данных...',
      updated_at: new Date().toISOString()
    });

    const result = await this.enrichment.enrichUnmappedInns();

    const duration = Date.now() - startTime;

    await this.progress.report({
      status: 'completed',
      percentage: 100,
      message: `Обогащение завершено: ${result.matched}/${result.processed} совпадений за ${duration}ms`,
      updated_at: new Date().toISOString()
    });

    console.log(`EnrichmentWorker: Completed in ${duration}ms`);
  }
}

/**
 * Фабрика для создания EnrichmentWorker
 */
export class EnrichmentWorkerFactory {
  private static instance: EnrichmentWorker | null = null;

  static create(
    enrichment: ExternalEnrichmentService,
    progress: ProgressReporter
  ): EnrichmentWorker {
    if (!this.instance) {
      this.instance = new EnrichmentWorker(enrichment, progress);
    }
    return this.instance;
  }

  static getInstance(): EnrichmentWorker | null {
    return this.instance;
  }
}
