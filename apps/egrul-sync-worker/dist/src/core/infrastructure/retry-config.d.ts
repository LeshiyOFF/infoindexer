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
export declare const DEFAULT_RETRY_CONFIG: RetryConfig;
