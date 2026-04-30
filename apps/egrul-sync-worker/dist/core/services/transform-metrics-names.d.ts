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
export declare const TRANSFORM_METRIC_NAMES: {
    /** Количество обработанных строк (всего) */
    readonly ROWS_PROCESSED_TOTAL: "transform.rows_processed_total";
    /** Количество успешных трансформаций */
    readonly SUCCESS_TOTAL: "transform.success_total";
    /** Количество неудачных трансформаций */
    readonly FAILED_TOTAL: "transform.failed_total";
    /** Использование памяти в МБ во время трансформации */
    readonly MEMORY_USAGE_MB: "transform.memory_usage_mb";
    /** Количество строк в staging таблице */
    readonly STAGING_ROW_COUNT: "transform.staging_row_count";
    /** Процент использования памяти */
    readonly MEMORY_PERCENT: "transform.memory_percent";
    /** Длительность трансформации в мс */
    readonly DURATION_MS: "transform.duration_ms";
    /** Длительность выборки данных из staging */
    readonly FETCH_DURATION_MS: "transform.fetch_duration_ms";
    /** Длительность агрегации данных */
    readonly AGGREGATE_DURATION_MS: "transform.aggregate_duration_ms";
    /** Длительность вставки в production */
    readonly INSERT_DURATION_MS: "transform.insert_duration_ms";
    /** Метрики для таблицы companies */
    readonly COMPANIES: "transform.companies";
    /** Метрики для таблицы directors */
    readonly DIRECTORS: "transform.directors";
    /** Метрики для таблицы founders */
    readonly FOUNDERS: "transform.founders";
};
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
export declare const TRANSFORM_METRIC_TAGS: {
    /** Имя таблицы */
    readonly TABLE: "table";
    /** Статус операции */
    readonly STATUS: "status";
    /** Тип ошибки */
    readonly ERROR_TYPE: "error_type";
    /** Имя staging таблицы */
    readonly STAGING_TABLE: "staging_table";
    /** Имя production таблицы */
    readonly PRODUCTION_TABLE: "production_table";
};
/**
 * Значения тегов для таблиц
 *
 * @remarks
 * Константы для значений тега 'table'.
 */
export declare const TABLE_NAMES: {
    readonly COMPANIES: "egrul_staging_companies";
    readonly DIRECTORSHIPS: "egrul_staging_directorships";
    readonly OWNERSHIPS: "egrul_staging_ownerships";
};
/**
 * Значения статусов
 *
 * @remarks
 * Константы для значений тега 'status'.
 */
export declare const STATUS_VALUES: {
    readonly RUNNING: "running";
    readonly SUCCESS: "success";
    readonly FAILED: "failed";
    readonly IDLE: "idle";
};
