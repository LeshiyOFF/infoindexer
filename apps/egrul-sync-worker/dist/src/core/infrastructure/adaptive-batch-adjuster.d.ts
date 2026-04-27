/**
 * Batch Size Adjuster
 *
 * Адаптирует размер батча на основе производительности.
 */
import type { AdaptiveBatchConfig } from './adaptive-batch-config';
/**
 * Регулятор размера батча
 */
export declare class BatchSizeAdjuster {
    private readonly config;
    currentSize: number;
    constructor(config: AdaptiveBatchConfig);
    /** Адаптирует размер на основе производительности */
    adapt(duration: number, success: boolean, avgDuration: number): void;
    /** Проверяет что выполнение слишком быстрое */
    private isTooFast;
    /** Проверяет что выполнение слишком медленное */
    private isTooSlow;
    /** Ограничивает размер в пределах min/max */
    private clampSize;
    /** Сброс к начальному размеру */
    reset(): void;
}
