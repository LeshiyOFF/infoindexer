/**
 * Console Query Metrics Adapter
 *
 * @remarks
 * Console-логирующая реализация IQueryMetricsCollector port.
 * Следует SRP: только сбор метрик в memory + логирование.
 * Следует DIP: реализует IQueryMetricsCollector port.
 * Следует LSP: может быть заменён на Prometheus/Redis adapter.
 *
 * Хранит метрики в memory. Для production использовать персистентный адаптер.
 */
import type { IQueryMetricsCollector, QueryMetrics } from '../ports/i-query-metrics-collector.port';
export declare class ConsoleQueryMetricsCollector implements IQueryMetricsCollector {
    private totalQueries;
    private totalErrors;
    private totalDurationMs;
    private totalRows;
    recordQuery(queryName: string, durationMs: number, rowsAffected: number): void;
    recordError(queryName: string, error: string): void;
    getMetrics(): QueryMetrics | null;
    /**
     * Сбросить накопленные метрики
     */
    reset(): void;
}
/**
 * Factory функция для создания ConsoleQueryMetricsCollector
 */
export declare function createQueryMetricsService(): IQueryMetricsCollector;
