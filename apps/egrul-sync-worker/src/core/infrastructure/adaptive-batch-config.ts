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
export const DEFAULT_BATCH_CONFIG: AdaptiveBatchConfig = {
  initialBatchSize: 100,
  minBatchSize: 10,
  maxBatchSize: 1000,
  targetDuration: 1000,
  growthFactor: 1.5,
  decayFactor: 0.5,
  metricsWindowSize: 5
} as const;
