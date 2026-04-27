/**
 * Retry Configuration
 */

/**
 * Стратегия ожидания между попытками
 */
export type BackoffStrategy = 'exponential' | 'linear' | 'constant';

/**
 * Конфигурация Retry Policy
 */
export interface RetryConfig {
  readonly maxAttempts: number;
  readonly baseDelay: number;
  readonly maxDelay: number;
  readonly strategy: BackoffStrategy;
  readonly multiplier: number;
  readonly jitter: number;
  readonly shouldRetry?: (error: Error) => boolean;
}

/**
 * Значения по умолчанию
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  strategy: 'exponential',
  multiplier: 2,
  jitter: 0.1
} as const;
