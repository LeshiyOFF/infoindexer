/**
 * Сервис для сбора метрик ClickHouse операций
 *
 * @remarks
 * Собирает метрики специфичные для ClickHouse:
 * - Memory usage per batch (через process.memoryUsage())
 * - Query timing
 * - Row counts
 *
 * Следует SRP: отвечает только за сбор ClickHouse метрик.
 * Следует DIP: зависит от IMetricsCollectorPort абстракции.
 *
 * @example
 * ```ts
 * const metricsService = new ClickHouseMetricsService(metricsCollector);
 * await metricsService.recordBatchMetrics('egrul_persons_raw', 1000000, 1234, true);
 * ```
 */
import type { IMetricsCollectorPort } from '../ports/i-metrics-collector.port';
import { type MemoryUsageApi } from './clickhouse-metrics-names';
/**
 * Сервис для сбора метрик ClickHouse операций
 *
 * @remarks
 * Оборачивает IMetricsCollectorPort для удобства записи ClickHouse метрик.
 */
export declare class ClickHouseMetricsService {
    private readonly metrics;
    private readonly memoryApi;
    /**
     * Создаёт сервис метрик ClickHouse
     *
     * @param metrics - Коллектор метрик (может быть NullMetricsAdapter)
     * @param memoryApi - API для получения memory usage (для тестирования)
     *
     * @remarks
     * memoryApi позволяет подменить process.memoryUsage в тестах.
     */
    constructor(metrics: IMetricsCollectorPort, memoryApi?: MemoryUsageApi);
    /**
     * Записывает метрики выполнения батча
     *
     * @param table - Имя таблицы
     * @param rowsProcessed - Количество обработанных строк
     * @param durationMs - Длительность в миллисекундах
     * @param success - Успешность выполнения
     *
     * @remarks
     * Записывает:
     * - Counter: batch.rows_processed
     * - Timing: batch_execute_duration_ms
     * - Gauge: memory.heap_used_mb
     * - Counter: batch.completed или batch.failed
     */
    recordBatchMetrics(table: string, rowsProcessed: number, durationMs: number, success: boolean): void;
    /**
     * Записывает метрики выполнения запроса
     *
     * @param operation - Тип операции (select, insert, etc)
     * @param tableName - Имя таблицы
     * @param durationMs - Длительность в миллисекундах
     *
     * @remarks
     * Записывает:
     * - Timing: clickhouse.query.duration_ms
     */
    recordQueryMetrics(operation: string, tableName: string, durationMs: number): void;
    /**
     * Записывает метрики использования памяти
     *
     * @param labels - Дополнительные лейблы
     *
     * @remarks
     * Записывает:
     * - Gauge: memory.heap_used_mb
     * - Gauge: memory.heap_total_mb
     * - Gauge: memory.rss_mb
     * - Gauge: memory.external_mb
     *
     * Использует process.memoryUsage() для получения значений.
     */
    recordMemoryMetrics(labels?: Record<string, string>): void;
    /**
     * Создаёт таймер для измерения длительности операции
     *
     * @param operation - Имя операции
     * @param labels - Дополнительные лейблы
     * @returns Функция для остановки таймера
     *
     * @remarks
     * @example
     * ```ts
     * const stopTimer = metricsService.startTimer('batch_process', { table: 'persons' });
     * await doWork();
     * stopTimer();
     * ```
     */
    startTimer(operation: string, labels?: Record<string, string>): () => void;
    /**
     * Возвращает heap used в мегабайтах
     *
     * @remarks
     * Приватный метод для получения текущего использования heap.
     */
    private getHeapUsedMB;
}
