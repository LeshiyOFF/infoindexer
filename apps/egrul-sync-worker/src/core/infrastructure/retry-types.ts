/**
 * Retry Types
 */

/**
 * Детали попытки для коллбэка
 */
export interface AttemptContext {
  readonly attempt: number;
  readonly totalAttempts: number;
  readonly delay: number;
  readonly lastError?: Error;
}

/**
 * Результат выполнения с Retry
 */
export type RetryResult<T> =
  | { success: true; value: T; attempts: number }
  | { success: false; error: Error; attempts: number };
