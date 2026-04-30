/**
 * Transform Metrics Names
 *
 * @remarks
 * Константы имён метрик для операций трансформации.
 * Value Object: immutable (as const) - единственный источник имён.
 *
 * Группировка по типам метрик:
 * - Counter: монотонно растущие значения (rows_processed, success_total)
 * - Gauge: текущие значения (memory_usage_mb, staging_row_count)
 * - Timing: длительность операций (duration_ms)
 *
 * @pattern Single Source of Truth (DRY)
 * @pattern Value Object
 */

/**
 * Имена метрик трансформации
 *
 * @remarks
 * Централизованное хранилище имён метрик для предотвращения опечаток.
 * Использует namespace префикс 'transform.' для группировки.
 */
export const TRANSFORM_METRIC_NAMES = {
  // === COUNTER METRICS ===
  // Монотонно растущие значения

  /** Количество обработанных строк (всего) */
  ROWS_PROCESSED_TOTAL: 'transform.rows_processed_total',

  /** Количество успешных трансформаций */
  SUCCESS_TOTAL: 'transform.success_total',

  /** Количество неудачных трансформаций */
  FAILED_TOTAL: 'transform.failed_total',

  // === GAUGE METRICS ===
  // Текущие значения (могут уменьшаться)

  /** Использование памяти в МБ во время трансформации */
  MEMORY_USAGE_MB: 'transform.memory_usage_mb',

  /** Количество строк в staging таблице */
  STAGING_ROW_COUNT: 'transform.staging_row_count',

  /** Процент использования памяти */
  MEMORY_PERCENT: 'transform.memory_percent',

  // === TIMING METRICS ===
  // Длительность операций

  /** Длительность трансформации в мс */
  DURATION_MS: 'transform.duration_ms',

  /** Длительность выборки данных из staging */
  FETCH_DURATION_MS: 'transform.fetch_duration_ms',

  /** Длительность агрегации данных */
  AGGREGATE_DURATION_MS: 'transform.aggregate_duration_ms',

  /** Длительность вставки в production */
  INSERT_DURATION_MS: 'transform.insert_duration_ms',

  // === TABLE-SPECIFIC METRICS ===
  // Метрики для конкретных таблиц

  /** Метрики для таблицы companies */
  COMPANIES: 'transform.companies',

  /** Метрики для таблицы directors */
  DIRECTORS: 'transform.directors',

  /** Метрики для таблицы founders */
  FOUNDERS: 'transform.founders'
} as const;

/**
 * Тип имени метрики
 *
 * @remarks
 * Union type всех значений из TRANSFORM_METRIC_NAMES.
 * Используется для типизации параметров.
 */
export type TransformMetricName = typeof TRANSFORM_METRIC_NAMES[keyof typeof TRANSFORM_METRIC_NAMES];

/**
 * Теги метрик трансформации
 *
 * @remarks
 * Константы для часто используемых тегов.
 */
export const TRANSFORM_METRIC_TAGS = {
  /** Имя таблицы */
  TABLE: 'table',

  /** Статус операции */
  STATUS: 'status',

  /** Тип ошибки */
  ERROR_TYPE: 'error_type',

  /** Имя staging таблицы */
  STAGING_TABLE: 'staging_table',

  /** Имя production таблицы */
  PRODUCTION_TABLE: 'production_table'
} as const;

/**
 * Значения тегов для таблиц
 *
 * @remarks
 * Константы для значений тега 'table'.
 */
export const TABLE_NAMES = {
  COMPANIES: 'egrul_staging_companies',
  DIRECTORSHIPS: 'egrul_staging_directorships',
  OWNERSHIPS: 'egrul_staging_ownerships'
} as const;

/**
 * Значения статусов
 *
 * @remarks
 * Константы для значений тега 'status'.
 */
export const STATUS_VALUES = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  IDLE: 'idle'
} as const;
