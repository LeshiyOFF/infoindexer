"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleQueryMetricsCollector = void 0;
exports.createQueryMetricsService = createQueryMetricsService;
class ConsoleQueryMetricsCollector {
    totalQueries = 0;
    totalErrors = 0;
    totalDurationMs = 0;
    totalRows = 0;
    recordQuery(queryName, durationMs, rowsAffected) {
        this.totalQueries++;
        this.totalDurationMs += durationMs;
        this.totalRows += rowsAffected;
        console.log(`[METRICS] ${queryName}: ${durationMs}ms, ${rowsAffected} rows`);
    }
    recordError(queryName, error) {
        this.totalErrors++;
        console.error(`[METRICS] ${queryName} ERROR: ${error}`);
    }
    getMetrics() {
        if (this.totalQueries === 0) {
            return null;
        }
        return {
            totalQueries: this.totalQueries,
            totalErrors: this.totalErrors,
            totalDurationMs: this.totalDurationMs,
            totalRows: this.totalRows
        };
    }
    /**
     * Сбросить накопленные метрики
     */
    reset() {
        this.totalQueries = 0;
        this.totalErrors = 0;
        this.totalDurationMs = 0;
        this.totalRows = 0;
    }
}
exports.ConsoleQueryMetricsCollector = ConsoleQueryMetricsCollector;
/**
 * Factory функция для создания ConsoleQueryMetricsCollector
 */
function createQueryMetricsService() {
    return new ConsoleQueryMetricsCollector();
}
