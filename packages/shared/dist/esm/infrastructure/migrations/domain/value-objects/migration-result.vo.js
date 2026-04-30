/**
 * Migration Result Value Object
 *
 * @remarks
 * Value Object: результат применения одной миграции.
 * Следует иммутабельности: readonly свойства.
 *
 * MigrationResult импортируется из ports/i-migration-runner.port.ts
 * чтобы избежать дублирования экспорта.
 */
/**
 * Создаёт успешный результат миграции
 *
 * @param version - Версия миграции
 * @param durationMs - Время выполнения
 * @returns Успешный результат
 */
export function createSuccessResult(version, durationMs) {
    return {
        success: true,
        version,
        durationMs,
        appliedAt: new Date()
    };
}
/**
 * Создаёт неуспешный результат миграции
 *
 * @param version - Версия миграции
 * @param durationMs - Время выполнения
 * @param error - Ошибка
 * @returns Неуспешный результат
 */
export function createFailureResult(version, durationMs, error) {
    return {
        success: false,
        version,
        durationMs,
        error
    };
}
