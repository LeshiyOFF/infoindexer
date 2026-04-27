/**
 * Backoff Calculator
 *
 * Вычисляет задержку между попытками retry.
 */
import type { RetryConfig } from './retry-config';
/**
 * Калькулятор задержки с backoff
 */
export declare class BackoffCalculator {
    private readonly config;
    private readonly random;
    constructor(config: RetryConfig, random: () => number);
    /** Вычисляет задержку с учётом стратегии и jitter */
    calculate(attempt: number): number;
    /** Базовая задержка по стратегии */
    private getBaseDelay;
    /** Применяет jitter для разброса */
    private applyJitter;
}
