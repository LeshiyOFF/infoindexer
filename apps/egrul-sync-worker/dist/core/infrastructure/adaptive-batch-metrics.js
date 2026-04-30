"use strict";
/**
 * Batch Metrics Tracker
 *
 * Отслеживает метрики выполнения батчей.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMetricsTracker = void 0;
/**
 * Трекер метрик батчей
 */
class BatchMetricsTracker {
    windowSize;
    now;
    metrics = [];
    totalProcessed = 0;
    totalBatches = 0;
    successfulBatches = 0;
    constructor(windowSize, now = Date.now) {
        this.windowSize = windowSize;
        this.now = now;
    }
    /** Записывает метрику выполнения */
    record(size, duration, success, timestamp) {
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
    getAverageDuration() {
        const successful = this.metrics.filter(m => m.success);
        if (successful.length === 0)
            return 0;
        const sum = successful.reduce((acc, m) => acc + m.duration, 0);
        return sum / successful.length;
    }
    /** Доля успешных батчей */
    get successRate() {
        return this.totalBatches > 0 ? this.successfulBatches / this.totalBatches : 1;
    }
    /** Сброс статистики */
    reset() {
        this.metrics.length = 0;
        this.totalProcessed = 0;
        this.totalBatches = 0;
        this.successfulBatches = 0;
    }
}
exports.BatchMetricsTracker = BatchMetricsTracker;
