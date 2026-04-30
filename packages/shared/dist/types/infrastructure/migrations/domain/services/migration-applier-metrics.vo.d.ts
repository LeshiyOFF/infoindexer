/**
 * Migration Applier Metrics
 *
 * @remarks
 * Value Object для логирования и создания результатов применения миграций.
 * Вынесен из MigrationApplierService для соблюдения лимита строк.
 *
 * @pattern Value Object
 * @pattern Single Responsibility Principle
 */
import type { MigrationDescriptor, MigrationStats } from '../value-objects';
/**
 * Результат применения одной миграции
 */
export interface MigrationResult {
    readonly success: boolean;
    readonly skipped: boolean;
    readonly durationMs: number;
    readonly error?: string;
}
/**
 * Метрики применения миграций
 *
 * @remarks
 * VO для логирования и создания результатов.
 */
export declare class MigrationApplierMetrics {
    /**
     * Логирует начало применения
     */
    logStart(): void;
    /**
     * Логирует пропуск миграции
     *
     * @param descriptor - Дескриптор миграции
     */
    logSkip(descriptor: MigrationDescriptor): void;
    /**
     * Логирует успех
     *
     * @param descriptor - Дескриптор миграции
     * @param result - Результат применения
     */
    logSuccess(descriptor: MigrationDescriptor, result: {
        durationMs: number;
    }): void;
    /**
     * Логирует ошибку
     *
     * @param descriptor - Дескриптор миграции
     * @param result - Результат с ошибкой
     */
    logFailure(descriptor: MigrationDescriptor, result: MigrationResult): void;
    /**
     * Логирует завершение
     *
     * @param stats - Статистика
     */
    logCompletion(stats: MigrationStats): void;
    /**
     * Создаёт результат пропуска
     *
     * @param startTime - Время начала
     * @returns Результат
     */
    static createSkipResult(startTime: number): MigrationResult;
    /**
     * Создаёт результат успеха
     *
     * @param result - Результат из runner
     * @param startTime - Время начала
     * @returns Результат
     */
    static createSuccessResult(result: {
        durationMs: number;
    }, startTime: number): MigrationResult;
    /**
     * Создаёт результат ошибки
     *
     * @param result - Результат из runner
     * @param startTime - Время начала
     * @returns Результат
     */
    static createFailureResult(result: {
        durationMs: number;
        error?: string;
    }, startTime: number): MigrationResult;
    /**
     * Создаёт результат ошибки из exception
     *
     * @param error - Ошибка
     * @param startTime - Время начала
     * @returns Результат
     */
    static createErrorResult(error: unknown, startTime: number): MigrationResult;
}
/**
 * Создаёт метрики применения
 *
 * @returns Метрики
 */
export declare function createMigrationApplierMetrics(): MigrationApplierMetrics;
