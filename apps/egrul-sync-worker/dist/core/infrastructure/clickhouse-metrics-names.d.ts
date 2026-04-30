/**
 * Константы для имён метрик ClickHouse
 *
 * @remarks
 * Централизованные имена метрик для предотвращения опечаток.
 * Value Object: неизменяемый (as const).
 */
/**
 * Имена метрик ClickHouse
 *
 * @remarks
 * Константы имён метрик для использования в коде.
 * Централизованное хранилище для предотвращения опечаток.
 */
export declare const CLICKHOUSE_METRIC_NAMES: {
    readonly BATCH_ROWS_PROCESSED: "batch.rows_processed";
    readonly BATCH_COMPLETED: "batch.completed";
    readonly BATCH_FAILED: "batch.failed";
    readonly BATCH_TOTAL: "batch.total";
    readonly BATCH_ERRORS: "batch.errors";
    readonly BATCH_EXECUTE: "batch_execute";
    readonly BATCH_TOTAL_DURATION: "batch.total_duration_ms";
    readonly QUERY_DURATION: "clickhouse.query.duration_ms";
    readonly MEMORY_HEAP_USED: "memory.heap_used_mb";
    readonly MEMORY_HEAP_TOTAL: "memory.heap_total_mb";
    readonly MEMORY_RSS: "memory.rss_mb";
    readonly MEMORY_EXTERNAL: "memory.external_mb";
};
/**
 * API для получения информации о памяти
 *
 * @remarks
 * Type alias для подмены в тестах.
 */
export type MemoryUsageApi = () => NodeJS.MemoryUsage;
/**
 * Конвертер байтов в мегабайты
 *
 * @param bytes - Значение в байтах
 * @returns Значение в мегабайтах
 *
 * @remarks
 * Pure function для конвертации единиц измерения.
 * Используется в ClickHouseMetricsService.
 */
export declare function bytesToMB(bytes: number): number;
