/**
 * Adaptive Batch Writer
 *
 * Адаптивно меняет размер батча на основе производительности.
 */
import { type AdaptiveBatchConfig } from './adaptive-batch-config';
import type { BatchWriterStats } from './adaptive-batch-types';
/**
 * Адаптивный батч-райтер
 */
export declare class AdaptiveBatchWriter<T = unknown> {
    readonly config: AdaptiveBatchConfig;
    private readonly metrics;
    private readonly adjuster;
    constructor(config?: AdaptiveBatchConfig, now?: () => number);
    /** Текущий размер батча */
    get batchSize(): number;
    /** Добавляет элементы и выполняет батч */
    add(items: readonly T[], fn: (batch: readonly T[]) => Promise<void>): Promise<void>;
    /** Статистика работы */
    getStats(): BatchWriterStats;
    /** Сбрасывает статистику */
    reset(): void;
    /** Новый writer с изменённой конфигурацией */
    withConfig(partialConfig: Partial<AdaptiveBatchConfig>): AdaptiveBatchWriter<T>;
}
/** Factory для создания типизированного batch writer */
export declare function createBatchWriter<T>(config?: AdaptiveBatchConfig): AdaptiveBatchWriter<T>;
export * from './adaptive-batch-types';
export * from './adaptive-batch-config';
