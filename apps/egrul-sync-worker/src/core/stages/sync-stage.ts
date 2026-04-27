/**
 * Base Sync Stage
 *
 * Базовый класс для всех stage синхронизации.
 */

import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import type { RetryPolicy } from '../infrastructure/retry';
import { SyncStage as SyncStageEnum } from 'shared';
import type {
  StageContext,
  StageResult,
  StageOptions,
  StageMetadata
} from './stage-context';
import { stageFailure, isStageFailure } from './stage-context';
import { SyncStageReporter } from './sync-stage-reporter';

/**
 * Базовый абстрактный класс для stage синхронизации
 */
export abstract class BaseSyncStage {
  private readonly reporter: SyncStageReporter;

  constructor(
    protected readonly context: StageContext
  ) {
    this.reporter = new SyncStageReporter(context.reporter);
  }

  /**
   * Выполняет stage с обработкой ошибок и progress reporting
   */
  async execute(options: StageOptions = {}): Promise<StageResult> {
    const { onProgress, skipErrors = false } = options;

    try {
      const metadata = this.getMetadata();

      await this.reporter.reportStart(metadata);

      const result = await this.runInternal({
        ...options,
        onProgress: (progress, message) => {
          const adjustedProgress = this.adjustProgress(progress, metadata);
          onProgress?.(adjustedProgress, message);
          this.reporter.throttledReport(metadata, adjustedProgress, message);
        }
      });

      if (isStageFailure(result) && !skipErrors) {
        await this.reporter.reportError(metadata, result.error, result.code);
        return result;
      }

      await this.reporter.reportComplete(metadata, result);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const code = error instanceof Error ? error.name : 'UNKNOWN_ERROR';
      const metadata = this.getMetadata();
      await this.reporter.reportError(metadata, errorMessage, code);
      return stageFailure(errorMessage, code);
    }
  }

  /**
   * Основная логика stage (должна быть переопределена)
   */
  protected abstract runInternal(options: StageOptions): Promise<StageResult>;

  /**
   * Возвращает метаданные stage
   */
  protected abstract getMetadata(): StageMetadata;

  /**
   * Выполняет HTTP запрос с circuit breaker и retry
   */
  protected async executeWithResilience<T>(
    fn: () => Promise<T>,
    operation: string
  ): Promise<T> {
    const retryResult = await this.context.retryPolicy.execute(async () => {
      const circuitResult = await this.context.circuitBreaker.execute(fn);
      if (!circuitResult.success) {
        throw new Error(circuitResult.error);
      }
      return circuitResult.value;
    });

    if (!retryResult.success) {
      throw retryResult.error;
    }

    return retryResult.value;
  }

  /**
   * Проверяет, является ли ошибка повторяемой
   */
  protected isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
      const retryableMessages = [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'EAI_AGAIN',
        'socket hang up',
        'timeout'
      ];

      return retryableMessages.some(msg =>
        error.message.includes(msg)
      );
    }
    return false;
  }

  /**
   * Корректирует процент выполнения в диапазоне stage
   */
  private adjustProgress(progress: number, metadata: StageMetadata): number {
    const range = metadata.endPercentage - metadata.startPercentage;
    return metadata.startPercentage + (range * progress / 100);
  }
}
