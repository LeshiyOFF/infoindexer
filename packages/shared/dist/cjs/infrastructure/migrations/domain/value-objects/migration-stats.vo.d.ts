/**
 * Migration Stats Value Object
 *
 * @remarks
 * Value Object: статистика выполнения миграций.
 * Следует иммутабельности: readonly свойства.
 */
/**
 * Статистика выполнения миграций
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Агрегирует результаты применения всех миграций.
 */
export interface MigrationStats {
    /** Общее количество миграций */
    readonly total: number;
    /** Количество применённых миграций */
    readonly applied: number;
    /** Количество пропущенных (уже применённых) */
    readonly skipped: number;
    /** Количество неудачных миграций */
    readonly failed: number;
    /** Общее время выполнения в мс */
    readonly durationMs: number;
}
/**
 * Создаёт начальную статистику
 *
 * @returns Пустая статистика
 */
export declare function createInitialStats(): MigrationStats;
/**
 * Обновляет статистику после применения миграции
 *
 * @param stats - Текущая статистика
 * @param result - Результат миграции
 * @returns Обновлённая статистика
 */
export declare function updateStats(stats: MigrationStats, result: {
    success: boolean;
    skipped: boolean;
    durationMs: number;
}): MigrationStats;
/**
 * Объединяет две статистики
 *
 * @param a - Первая статистика
 * @param b - Вторая статистика
 * @returns Объединённая статистика
 */
export declare function mergeStats(a: MigrationStats, b: MigrationStats): MigrationStats;
