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
export const CLICKHOUSE_METRIC_NAMES = {
  // Counters
  BATCH_ROWS_PROCESSED: 'batch.rows_processed',
  BATCH_COMPLETED: 'batch.completed',
  BATCH_FAILED: 'batch.failed',
  BATCH_TOTAL: 'batch.total',
  BATCH_ERRORS: 'batch.errors',

  // Timing
  BATCH_EXECUTE: 'batch_execute',
  BATCH_TOTAL_DURATION: 'batch.total_duration_ms',
  QUERY_DURATION: 'clickhouse.query.duration_ms',

  // Gauges
  MEMORY_HEAP_USED: 'memory.heap_used_mb',
  MEMORY_HEAP_TOTAL: 'memory.heap_total_mb',
  MEMORY_RSS: 'memory.rss_mb',
  MEMORY_EXTERNAL: 'memory.external_mb'
} as const;

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
export function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}
