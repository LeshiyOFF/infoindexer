/**
 * Adaptive Batch Writer
 *
 * Адаптивно меняет размер батча на основе производительности.
 */

import { DEFAULT_BATCH_CONFIG, type AdaptiveBatchConfig } from './adaptive-batch-config';
import { BatchMetricsTracker } from './adaptive-batch-metrics';
import { BatchSizeAdjuster } from './adaptive-batch-adjuster';
import type { BatchWriterStats } from './adaptive-batch-types';

/**
 * Адаптивный батч-райтер
 */
export class AdaptiveBatchWriter<T = unknown> {
  private readonly metrics: BatchMetricsTracker;
  private readonly adjuster: BatchSizeAdjuster;

  constructor(
    public readonly config: AdaptiveBatchConfig = DEFAULT_BATCH_CONFIG,
    now: () => number = Date.now
  ) {
    this.metrics = new BatchMetricsTracker(config.metricsWindowSize, now);
    this.adjuster = new BatchSizeAdjuster(config);
  }

  /** Текущий размер батча */
  get batchSize(): number {
    return this.adjuster.currentSize;
  }

  /** Добавляет элементы и выполняет батч */
  async add(
    items: readonly T[],
    fn: (batch: readonly T[]) => Promise<void>
  ): Promise<void> {
    if (items.length === 0) return;

    const startTime = this.metrics.now();
    let success = false;

    try {
      await fn(items);
      success = true;
    } finally {
      const duration = this.metrics.now() - startTime;
      this.metrics.record(items.length, duration, success, startTime);
      this.adjuster.adapt(duration, success, this.metrics.getAverageDuration());
    }
  }

  /** Статистика работы */
  getStats(): BatchWriterStats {
    return {
      currentBatchSize: this.adjuster.currentSize,
      totalProcessed: this.metrics.totalProcessed,
      totalBatches: this.metrics.totalBatches,
      successRate: this.metrics.successRate,
      averageDuration: this.metrics.getAverageDuration()
    };
  }

  /** Сбрасывает статистику */
  reset(): void {
    this.metrics.reset();
    this.adjuster.reset();
  }

  /** Новый writer с изменённой конфигурацией */
  withConfig(partialConfig: Partial<AdaptiveBatchConfig>): AdaptiveBatchWriter<T> {
    return new AdaptiveBatchWriter<T>(
      { ...this.config, ...partialConfig },
      this.metrics.now
    );
  }
}

/** Factory для создания типизированного batch writer */
export function createBatchWriter<T>(
  config?: AdaptiveBatchConfig
): AdaptiveBatchWriter<T> {
  return new AdaptiveBatchWriter<T>(config);
}

export * from './adaptive-batch-types';
export * from './adaptive-batch-config';
