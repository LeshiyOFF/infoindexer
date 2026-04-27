/**
 * Adaptive Batch Writer Types
 */

/**
 * Статистика работы батч-райтера
 */
export interface BatchWriterStats {
  readonly currentBatchSize: number;
  readonly totalProcessed: number;
  readonly totalBatches: number;
  readonly successRate: number;
  readonly averageDuration: number;
}
