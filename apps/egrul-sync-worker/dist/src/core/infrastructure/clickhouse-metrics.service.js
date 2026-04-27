"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseMetricsService = void 0;
const clickhouse_metrics_names_1 = require("./clickhouse-metrics-names");
/**
 * Сервис для сбора метрик ClickHouse операций
 *
 * @remarks
 * Оборачивает IMetricsCollectorPort для удобства записи ClickHouse метрик.
 */
class ClickHouseMetricsService {
    metrics;
    memoryApi;
    /**
     * Создаёт сервис метрик ClickHouse
     *
     * @param metrics - Коллектор метрик (может быть NullMetricsAdapter)
     * @param memoryApi - API для получения memory usage (для тестирования)
     *
     * @remarks
     * memoryApi позволяет подменить process.memoryUsage в тестах.
     */
    constructor(metrics, memoryApi = process.memoryUsage) {
        this.metrics = metrics;
        this.memoryApi = memoryApi;
    }
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
    recordBatchMetrics(table, rowsProcessed, durationMs, success) {
        const tags = { table };
        this.metrics.recordCounter(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.BATCH_ROWS_PROCESSED, rowsProcessed, tags);
        this.metrics.recordTiming(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.BATCH_EXECUTE, durationMs, tags);
        this.metrics.recordGauge(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.MEMORY_HEAP_USED, this.getHeapUsedMB(), tags);
        if (success) {
            this.metrics.recordCounter(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.BATCH_COMPLETED, 1, tags);
        }
        else {
            this.metrics.recordCounter(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.BATCH_FAILED, 1, tags);
        }
    }
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
    recordQueryMetrics(operation, tableName, durationMs) {
        this.metrics.recordTiming(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.QUERY_DURATION, durationMs, { operation, table: tableName });
    }
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
    recordMemoryMetrics(labels = {}) {
        const mem = this.memoryApi();
        this.metrics.recordGauge(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.MEMORY_HEAP_USED, (0, clickhouse_metrics_names_1.bytesToMB)(mem.heapUsed), labels);
        this.metrics.recordGauge(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.MEMORY_HEAP_TOTAL, (0, clickhouse_metrics_names_1.bytesToMB)(mem.heapTotal), labels);
        this.metrics.recordGauge(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.MEMORY_RSS, (0, clickhouse_metrics_names_1.bytesToMB)(mem.rss), labels);
        if (mem.external) {
            this.metrics.recordGauge(clickhouse_metrics_names_1.CLICKHOUSE_METRIC_NAMES.MEMORY_EXTERNAL, (0, clickhouse_metrics_names_1.bytesToMB)(mem.external), labels);
        }
    }
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
    startTimer(operation, labels = {}) {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            this.metrics.recordTiming(operation, duration, labels);
        };
    }
    /**
     * Возвращает heap used в мегабайтах
     *
     * @remarks
     * Приватный метод для получения текущего использования heap.
     */
    getHeapUsedMB() {
        return (0, clickhouse_metrics_names_1.bytesToMB)(this.memoryApi().heapUsed);
    }
}
exports.ClickHouseMetricsService = ClickHouseMetricsService;
