/**
 * Batch Size Adjuster
 *
 * Адаптирует размер батча на основе производительности.
 */

import type { AdaptiveBatchConfig } from './adaptive-batch-config';

/**
 * Регулятор размера батча
 */
export class BatchSizeAdjuster {
  currentSize: number;

  constructor(private readonly config: AdaptiveBatchConfig) {
    this.currentSize = this.clampSize(config.initialBatchSize);
  }

  /** Адаптирует размер на основе производительности */
  adapt(duration: number, success: boolean, avgDuration: number): void {
    if (!success) {
      this.currentSize = this.clampSize(
        Math.floor(this.currentSize * this.config.decayFactor)
      );
      return;
    }

    // Анализируем производительность
    if (this.isTooFast(duration, avgDuration)) {
      this.currentSize = this.clampSize(
        Math.ceil(this.currentSize * this.config.growthFactor)
      );
    } else if (this.isTooSlow(duration)) {
      this.currentSize = this.clampSize(
        Math.floor(this.currentSize * this.config.decayFactor)
      );
    }
  }

  /** Проверяет что выполнение слишком быстрое */
  private isTooFast(duration: number, avgDuration: number): boolean {
    return duration < this.config.targetDuration && avgDuration < this.config.targetDuration;
  }

  /** Проверяет что выполнение слишком медленное */
  private isTooSlow(duration: number): boolean {
    return duration > this.config.targetDuration * 1.5;
  }

  /** Ограничивает размер в пределах min/max */
  private clampSize(size: number): number {
    return Math.max(
      this.config.minBatchSize,
      Math.min(this.config.maxBatchSize, size)
    );
  }

  /** Сброс к начальному размеру */
  reset(): void {
    this.currentSize = this.clampSize(this.config.initialBatchSize);
  }
}
