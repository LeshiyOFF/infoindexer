/**
 * Retry Policy
 *
 * Политика повторных попыток с экспоненциальным backoff.
 */
import { type RetryConfig } from './retry-config';
import type { RetryResult, AttemptContext } from './retry-types';
/**
 * Retry Policy с экспоненциальным backoff
 */
export declare class RetryPolicy {
    readonly config: RetryConfig;
    private readonly random;
    constructor(config?: RetryConfig, random?: () => number);
    /** Выполняет функцию с retry логикой */
    execute<T>(fn: (context: AttemptContext) => Promise<T>): Promise<RetryResult<T>>;
    /** Создаёт контекст попытки */
    private createContext;
    /** Проверяет нужно ли остановить попытки */
    private shouldStopAttempt;
    /** Вычисляет задержку */
    private calculateDelay;
    /** Задержка выполнения */
    private sleep;
    /** Новая политика с изменённой конфигурацией */
    withConfig(partialConfig: Partial<RetryConfig>): RetryPolicy;
}
export * from './retry-types';
export * from './retry-config';
export * from './retry-strategies';
