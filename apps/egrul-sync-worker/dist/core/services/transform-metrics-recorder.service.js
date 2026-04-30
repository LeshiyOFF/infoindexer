"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformMetricsRecorder = void 0;
const transform_metrics_names_1 = require("./transform-metrics-names");
/**
 * Transform Metrics Recorder
 *
 * @remarks
 * Сервис для записи метрик операций трансформации.
 * Разделён из EgrulTransformService для соблюдения размера файла.
 */
class TransformMetricsRecorder {
    metrics;
    constructor(metrics) {
        this.metrics = metrics;
    }
    /**
     * Записать метрики начала трансформации
     *
     * @param tableName - Имя таблицы
     * @param stagingStorage - Хранилище staging
     */
    async recordStart(tableName, stagingStorage) {
        if (!this.metrics)
            return;
        const stats = await stagingStorage.getStats(tableName);
        const tableShort = this.getShortTableName(tableName);
        this.metrics.recordGauge(transform_metrics_names_1.TRANSFORM_METRIC_NAMES.STAGING_ROW_COUNT, stats.rowCount, { table: tableShort });
    }
    /**
     * Записать метрики выборки данных
     *
     * @param tableName - Имя таблицы
     * @param durationMs - Длительность в мс
     */
    async recordFetch(tableName, durationMs) {
        if (!this.metrics)
            return;
        this.metrics.recordTiming(transform_metrics_names_1.TRANSFORM_METRIC_NAMES.FETCH_DURATION_MS, durationMs, { table: this.getShortTableName(tableName) });
    }
    /**
     * Записать метрики агрегации
     *
     * @param tableName - Имя таблицы
     * @param durationMs - Длительность в мс
     */
    async recordAggregate(tableName, durationMs) {
        if (!this.metrics)
            return;
        this.metrics.recordTiming(transform_metrics_names_1.TRANSFORM_METRIC_NAMES.AGGREGATE_DURATION_MS, durationMs, { table: this.getShortTableName(tableName) });
    }
    /**
     * Записать метрики успешной трансформации
     *
     * @param tableName - Имя таблицы
     * @param rows - Количество строк
     * @param durationMs - Длительность в мс
     */
    async recordSuccess(tableName, rows, durationMs) {
        if (!this.metrics)
            return;
        const tableShort = this.getShortTableName(tableName);
        this.metrics.recordCounter(transform_metrics_names_1.TRANSFORM_METRIC_NAMES.SUCCESS_TOTAL, 1, { table: tableShort });
        this.metrics.recordCounter(transform_metrics_names_1.TRANSFORM_METRIC_NAMES.ROWS_PROCESSED_TOTAL, rows, { table: tableShort });
        this.metrics.recordTiming(transform_metrics_names_1.TRANSFORM_METRIC_NAMES.DURATION_MS, durationMs, { table: tableShort });
    }
    /**
     * Записать метрики неудачной трансформации
     *
     * @param tableName - Имя таблицы
     * @param error - Ошибка
     * @param durationMs - Длительность в мс
     */
    async recordFailure(tableName, error, durationMs) {
        if (!this.metrics)
            return;
        const tableShort = this.getShortTableName(tableName);
        const errorType = this.getErrorType(error);
        this.metrics.recordCounter(transform_metrics_names_1.TRANSFORM_METRIC_NAMES.FAILED_TOTAL, 1, {
            table: tableShort,
            error_type: errorType
        });
        this.metrics.recordTiming(transform_metrics_names_1.TRANSFORM_METRIC_NAMES.DURATION_MS, durationMs, { table: tableShort, status: 'failed' });
    }
    /**
     * Получить короткое имя таблицы для метрик
     *
     * @param fullName - Полное имя таблицы
     * @returns Короткое имя
     */
    getShortTableName(fullName) {
        if (fullName.includes('companies'))
            return transform_metrics_names_1.TRANSFORM_METRIC_NAMES.COMPANIES;
        if (fullName.includes('directorships'))
            return transform_metrics_names_1.TRANSFORM_METRIC_NAMES.DIRECTORS;
        if (fullName.includes('ownerships'))
            return transform_metrics_names_1.TRANSFORM_METRIC_NAMES.FOUNDERS;
        return fullName;
    }
    /**
     * Классифицировать тип ошибки
     *
     * @param error - Сообщение об ошибке
     * @returns Тип ошибки
     */
    getErrorType(error) {
        if (error.includes('memory') || error.includes('Memory'))
            return 'oom';
        if (error.includes('timeout') || error.includes('Timeout'))
            return 'timeout';
        if (error.includes('connection') || error.includes('Connection'))
            return 'connection';
        return 'unknown';
    }
}
exports.TransformMetricsRecorder = TransformMetricsRecorder;
