/**
 * Retry Policy
 *
 * Политика повторных попыток с экспоненциальным backoff.
 * Special handling for ClickHouse quota errors.
 */

import { DEFAULT_RETRY_CONFIG, type RetryConfig } from './retry-config';
import { BackoffCalculator } from './retry-backoff';
import type { RetryResult, AttemptContext } from './retry-types';

/**
 * Проверяет является ли ошибка ClickHouse quota error
 *
 * ClickHouse error codes:
 * - 201 = QUOTA_EXCEEDED
 * - 202 = TOO_MANY_SIMULTANEOUS_QUERIES
 *
 * @remarks
 * Также проверяет текст сообщения потому что разные драйверы
 * по-разному прокидывают код ошибки.
 */
function isQuotaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const msg = error.message.toLowerCase();
  const code = (error as { code?: number | string }).code;

  // Check by error code
  if (code === 201 || code === '201' || code === 202 || code === '202') {
    return true;
  }

  // Check by message text
  return /quota.*exceed/i.test(msg) || /too many simultaneous queries/i.test(msg);
}

/**
 * Retry Policy с экспоненциальным backoff
 */
export class RetryPolicy {
  constructor(
    public readonly config: RetryConfig = DEFAULT_RETRY_CONFIG,
    private readonly random: () => number = Math.random
  ) {}

  /** Выполняет функцию с retry логикой */
  async execute<T>(
    fn: (context: AttemptContext) => Promise<T>
  ): Promise<RetryResult<T>> {
    let lastError: Error | null = null;
    let attempt = 1;

    while (attempt <= this.config.maxAttempts) {
      try {
        const value = await fn(this.createContext(attempt, lastError ?? undefined));
        return { success: true, value, attempts: attempt };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Quota error - special handling: wait 60s, don't count as attempt
        if (isQuotaError(lastError)) {
          await this.sleep(60_000);
          // Не инкрементируем attempt, просто продолжаем
          continue;
        }

        if (this.shouldStopAttempt(attempt, lastError)) {
          break;
        }

        attempt++;
        await this.sleep(this.calculateDelay(attempt));
      }
    }

    return {
      success: false,
      error: lastError ?? new Error('Retry failed without error'),
      attempts: this.config.maxAttempts
    };
  }

  /** Создаёт контекст попытки */
  private createContext(attempt: number, lastError?: Error): AttemptContext {
    return {
      attempt,
      totalAttempts: this.config.maxAttempts,
      delay: 0,
      lastError
    };
  }

  /** Проверяет нужно ли остановить попытки */
  private shouldStopAttempt(attempt: number, error: Error): boolean {
    if (attempt >= this.config.maxAttempts) return true;
    if (this.config.shouldRetry && !this.config.shouldRetry(error)) return true;
    return false;
  }

  /** Вычисляет задержку */
  private calculateDelay(attempt: number): number {
    return new BackoffCalculator(this.config, this.random).calculate(attempt);
  }

  /** Задержка выполнения */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Новая политика с изменённой конфигурацией */
  withConfig(partialConfig: Partial<RetryConfig>): RetryPolicy {
    return new RetryPolicy({ ...this.config, ...partialConfig }, this.random);
  }
}

export * from './retry-types';
export * from './retry-config';
export * from './retry-strategies';
