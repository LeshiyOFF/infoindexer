/**
 * Sanctions Only Sync Service
 *
 * Сервис для синхронизации только санкций из OpenSanctions
 * без полной перезагрузки данных ЕГРЮЛ.
 */

import type { ProgressReporter } from './infrastructure/progress-reporter';
import type { ISanctionRepository } from 'shared/repositories';
import type { SanctionParserService } from './parsers/sanction-parser.service';
import type { FTMHttpClient } from './infrastructure/http-client';
import type { ICircuitBreakerPort } from './ports/i-circuit-breaker.port';
import { SanctionsSyncStage } from './stages/sanctions-sync.stage';
import { CircuitBreaker } from './infrastructure/circuit-breaker';
import { RetryPolicy } from './infrastructure/retry';
import { ProgressReporterFactory } from './infrastructure/progress-reporter';
import { redisPub } from 'shared';

/**
 * Статус синхронизации санкций
 */
export type SanctionsSyncStatus = 'idle' | 'running' | 'completed' | 'error';

/**
 * Результат синхронизации санкций
 */
export interface SanctionsSyncResult {
  readonly status: SanctionsSyncStatus;
  readonly processed: number;
  readonly errors: number;
  readonly message: string;
}

/**
 * Конфигурация синхронизации санкций
 */
export interface SanctionsOnlyConfig {
  readonly apiUrl?: string;
  readonly batchSize?: number;
  readonly timeout?: number;
  readonly abortSignal?: AbortSignal;
}

/**
 * Сервис для синхронизации только санкций
 *
 * Позволяет обновить данные санкций без полной перезагрузки ЕГРЮЛ.
 */
export class SanctionsOnlyService {
  private readonly circuitBreaker: ICircuitBreakerPort;
  private readonly retryPolicy: RetryPolicy;

  constructor(
    private readonly repository: ISanctionRepository,
    private readonly parser: SanctionParserService,
    private readonly httpClient: FTMHttpClient
  ) {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      halfOpenTimeout: 60000,
      openTimeout: 30000,
      slidingWindowSize: 10000
    });
    this.retryPolicy = new RetryPolicy({
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      strategy: 'exponential',
      multiplier: 2,
      jitter: 0.1
    });
  }

  /**
   * Выполняет синхронизацию только санкций
   *
   * @param config - опциональная конфигурация
   * @returns результат синхронизации
   */
  async run(config: SanctionsOnlyConfig = {}): Promise<SanctionsSyncResult> {
    const { abortSignal } = config;

    // Проверяем abort перед началом операции
    if (abortSignal?.aborted) {
      return {
        status: 'error',
        processed: 0,
        errors: 0,
        message: 'Операция отменена'
      };
    }

    const progressReporter = ProgressReporterFactory.createForSanctions();

    try {
      // Создаём stage для синхронизации санкций
      const stage = new SanctionsSyncStage(
        {
          reporter: progressReporter,
          circuitBreaker: this.circuitBreaker,
          retryPolicy: this.retryPolicy,
          startTime: new Date()
        },
        this.repository,
        this.parser,
        this.httpClient,
        config
      );

      // Запускаем выполнение stage
      const result = await stage.execute({
        skipErrors: false,
        abortSignal,
        onProgress: (percentage, message) => {
          // Отчёт о прогрессе через ProgressReporter
          console.log(`[Sanctions Sync] ${percentage}% - ${message}`);
        }
      });

      if (result.success) {
        // Триггерим обновление кэша после успешной загрузки санкций
        await this.triggerCacheRefresh();

        return {
          status: 'completed',
          processed: result.processed,
          errors: 0,
          message: result.message ?? 'Синхронизация завершена'
        };
      } else {
        return {
          status: 'error',
          processed: 0,
          errors: 1,
          message: result.error ?? 'Ошибка синхронизации'
        };
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Если abort - удаляем частичные данные
      if (message === 'Sanctions sync aborted' || message === 'Operation aborted') {
        await this.handleAbort(progressReporter);
      }

      return {
        status: 'error',
        processed: 0,
        errors: 1,
        message
      };
    }
  }

  /**
   * Триггерит асинхронное обновление кэша через Redis pub/sub
   */
  private async triggerCacheRefresh(): Promise<void> {
    try {
      await redisPub.publish('sync:refresh:start', JSON.stringify({
        timestamp: new Date().toISOString(),
        trigger: 'sanctions_sync'
      }));
      console.log('[Sanctions Sync] Cache refresh triggered');
    } catch (error) {
      console.warn('[Sanctions Sync] Failed to trigger cache refresh:', error);
    }
  }

  /**
   * Обрабатывает abort синхронизации санкций
   *
   * @remarks
   * 1. Сообщает статус 'deleting'
   * 2. Удаляет частично загруженные данные
   * 3. Сообщает статус 'idle'
   */
  private async handleAbort(progressReporter: ProgressReporter): Promise<void> {
    console.log('Handling Sanctions sync abort...');

    await progressReporter.report(progressReporter.createState('deleting', 0, 'Удаление частично загруженных данных...'));

    await this.repository.deleteAll();

    await progressReporter.report(progressReporter.createState('idle', 0, 'Операция отменена'));
    console.log('Sanctions sync abort handled');
  }
}
