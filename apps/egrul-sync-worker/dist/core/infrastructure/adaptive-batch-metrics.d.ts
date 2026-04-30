/**
 * Batch Metrics Tracker
 *
 * Отслеживает метрики выполнения батчей.
 */
/**
 * Трекер метрик батчей
 */
export declare class BatchMetricsTracker {
    private readonly windowSize;
    readonly now: () => number;
    private readonly metrics;
    totalProcessed: number;
    totalBatches: number;
    successfulBatches: number;
    constructor(windowSize: number, now?: () => number);
    /** Записывает метрику выполнения */
    record(size: number, duration: number, success: boolean, timestamp: number): void;
    /** Средняя длительность успешных батчей */
    getAverageDuration(): number;
    /** Доля успешных батчей */
    get successRate(): number;
    /** Сброс статистики */
    reset(): void;
}
