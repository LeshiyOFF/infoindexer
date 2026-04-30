/**
 * Метрики применения миграций
 *
 * @remarks
 * VO для логирования и создания результатов.
 */
export class MigrationApplierMetrics {
    /**
     * Логирует начало применения
     */
    logStart() {
        console.log('--- CHECKING MIGRATIONS ---');
    }
    /**
     * Логирует пропуск миграции
     *
     * @param descriptor - Дескриптор миграции
     */
    logSkip(descriptor) {
        console.log(`Migration ${descriptor.category}/${descriptor.version} already applied, skipping`);
    }
    /**
     * Логирует успех
     *
     * @param descriptor - Дескриптор миграции
     * @param result - Результат применения
     */
    logSuccess(descriptor, result) {
        console.log(`Migration ${descriptor.category}/${descriptor.version} applied successfully in ${result.durationMs}ms`);
    }
    /**
     * Логирует ошибку
     *
     * @param descriptor - Дескриптор миграции
     * @param result - Результат с ошибкой
     */
    logFailure(descriptor, result) {
        console.error('Migration failed:', descriptor.version, result.error);
    }
    /**
     * Логирует завершение
     *
     * @param stats - Статистика
     */
    logCompletion(stats) {
        console.log('--- MIGRATIONS COMPLETED ---');
        console.log(`Total: ${stats.total}, Applied: ${stats.applied}, ` +
            `Skipped: ${stats.skipped}, Failed: ${stats.failed}, Duration: ${stats.durationMs}ms`);
    }
    /**
     * Создаёт результат пропуска
     *
     * @param startTime - Время начала
     * @returns Результат
     */
    static createSkipResult(startTime) {
        return {
            success: true,
            skipped: true,
            durationMs: Date.now() - startTime
        };
    }
    /**
     * Создаёт результат успеха
     *
     * @param result - Результат из runner
     * @param startTime - Время начала
     * @returns Результат
     */
    static createSuccessResult(result, startTime) {
        return {
            success: true,
            skipped: false,
            durationMs: result.durationMs
        };
    }
    /**
     * Создаёт результат ошибки
     *
     * @param result - Результат из runner
     * @param startTime - Время начала
     * @returns Результат
     */
    static createFailureResult(result, startTime) {
        return {
            success: false,
            skipped: false,
            durationMs: result.durationMs,
            error: result.error
        };
    }
    /**
     * Создаёт результат ошибки из exception
     *
     * @param error - Ошибка
     * @param startTime - Время начала
     * @returns Результат
     */
    static createErrorResult(error, startTime) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            skipped: false,
            durationMs: Date.now() - startTime,
            error: errorMessage
        };
    }
}
/**
 * Создаёт метрики применения
 *
 * @returns Метрики
 */
export function createMigrationApplierMetrics() {
    return new MigrationApplierMetrics();
}
