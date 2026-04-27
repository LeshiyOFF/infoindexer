/**
 * Adaptive Batch Writer Configuration
 */
/**
 * Конфигурация Adaptive Batch Writer
 */
export interface AdaptiveBatchConfig {
    readonly initialBatchSize: number;
    readonly minBatchSize: number;
    readonly maxBatchSize: number;
    readonly targetDuration: number;
    readonly growthFactor: number;
    readonly decayFactor: number;
    readonly metricsWindowSize: number;
}
/**
 * Значения по умолчанию
 */
export declare const DEFAULT_BATCH_CONFIG: AdaptiveBatchConfig;
