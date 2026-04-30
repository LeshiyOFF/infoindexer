/**
 * Migration Stats Value Object
 *
 * @remarks
 * Value Object: статистика выполнения миграций.
 * Следует иммутабельности: readonly свойства.
 */
/**
 * Создаёт начальную статистику
 *
 * @returns Пустая статистика
 */
export function createInitialStats() {
    return {
        total: 0,
        applied: 0,
        skipped: 0,
        failed: 0,
        durationMs: 0
    };
}
/**
 * Обновляет статистику после применения миграции
 *
 * @param stats - Текущая статистика
 * @param result - Результат миграции
 * @returns Обновлённая статистика
 */
export function updateStats(stats, result) {
    return {
        total: stats.total + 1,
        applied: result.success && !result.skipped ? stats.applied + 1 : stats.applied,
        skipped: result.skipped ? stats.skipped + 1 : stats.skipped,
        failed: !result.success ? stats.failed + 1 : stats.failed,
        durationMs: stats.durationMs + result.durationMs
    };
}
/**
 * Объединяет две статистики
 *
 * @param a - Первая статистика
 * @param b - Вторая статистика
 * @returns Объединённая статистика
 */
export function mergeStats(a, b) {
    return {
        total: a.total + b.total,
        applied: a.applied + b.applied,
        skipped: a.skipped + b.skipped,
        failed: a.failed + b.failed,
        durationMs: a.durationMs + b.durationMs
    };
}
