/**
 * Batch Metrics Tracker
 *
 * Отслеживает метрики выполнения батчей.
 */

interface BatchMetric {
  readonly size: number;
  readonly duration: number;
  readonly success: boolean;
  readonly timestamp: number;
}

/**
 * Трекер метрик батчей
 */
export class BatchMetricsTracker {
  private readonly metrics: BatchMetric[] = [];
  totalProcessed = 0;
  totalBatches = 0;
  successfulBatches = 0;

  constructor(
    private readonly windowSize: number,
    public readonly now: () => number = Date.now
  ) {}

  /** Записывает метрику выполнения */
  record(size: number, duration: number, success: boolean, timestamp: number): void {
    this.metrics.push({ size, duration, success, timestamp });
    this.totalProcessed += size;
    this.totalBatches++;

    if (success) {
      this.successfulBatches++;
    }

    // Ограничиваем окно
    if (this.metrics.length > this.windowSize) {
      this.metrics.shift();
    }
  }

  /** Средняя длительность успешных батчей */
  getAverageDuration(): number {
    const successful = this.metrics.filter(m => m.success);
    if (successful.length === 0) return 0;

    const sum = successful.reduce((acc, m) => acc + m.duration, 0);
    return sum / successful.length;
  }

  /** Доля успешных батчей */
  get successRate(): number {
    return this.totalBatches > 0 ? this.successfulBatches / this.totalBatches : 1;
  }

  /** Сброс статистики */
  reset(): void {
    this.metrics.length = 0;
    this.totalProcessed = 0;
    this.totalBatches = 0;
    this.successfulBatches = 0;
  }
}
