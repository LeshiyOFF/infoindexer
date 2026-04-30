/**
 * Transform Metrics Recorder
 *
 * @remarks
 * Helper service for recording transform metrics.
 * Follows SRP: только запись метрик трансформации.
 *
 * @pattern Single Responsibility Principle
 */
import type { IMetricsCollectorPort } from '../ports/i-metrics-collector.port';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
/**
 * Transform Metrics Recorder
 *
 * @remarks
 * Сервис для записи метрик операций трансформации.
 * Разделён из EgrulTransformService для соблюдения размера файла.
 */
export declare class TransformMetricsRecorder {
    private readonly metrics?;
    constructor(metrics?: IMetricsCollectorPort | undefined);
    /**
     * Записать метрики начала трансформации
     *
     * @param tableName - Имя таблицы
     * @param stagingStorage - Хранилище staging
     */
    recordStart(tableName: string, stagingStorage: IStagingStoragePort): Promise<void>;
    /**
     * Записать метрики выборки данных
     *
     * @param tableName - Имя таблицы
     * @param durationMs - Длительность в мс
     */
    recordFetch(tableName: string, durationMs: number): Promise<void>;
    /**
     * Записать метрики агрегации
     *
     * @param tableName - Имя таблицы
     * @param durationMs - Длительность в мс
     */
    recordAggregate(tableName: string, durationMs: number): Promise<void>;
    /**
     * Записать метрики успешной трансформации
     *
     * @param tableName - Имя таблицы
     * @param rows - Количество строк
     * @param durationMs - Длительность в мс
     */
    recordSuccess(tableName: string, rows: number, durationMs: number): Promise<void>;
    /**
     * Записать метрики неудачной трансформации
     *
     * @param tableName - Имя таблицы
     * @param error - Ошибка
     * @param durationMs - Длительность в мс
     */
    recordFailure(tableName: string, error: string, durationMs: number): Promise<void>;
    /**
     * Получить короткое имя таблицы для метрик
     *
     * @param fullName - Полное имя таблицы
     * @returns Короткое имя
     */
    private getShortTableName;
    /**
     * Классифицировать тип ошибки
     *
     * @param error - Сообщение об ошибке
     * @returns Тип ошибки
     */
    private getErrorType;
}
