/**
 * Memory Health Checker
 *
 * @remarks
 * Infrastructure Layer — Health Checker в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за проверку использования памяти.
 */
import type { ComponentHealth } from '../../domain/types/health.types';
/**
 * Health Checker для Memory
 *
 * @remarks
 * Проверяет использование heap памяти.
 */
export declare class MemoryHealthChecker {
    private readonly memoryLimitBytes;
    constructor(memoryLimitBytes?: number);
    /**
     * Проверяет использование памяти
     *
     * @returns Статус компонента
     *
     * @remarks
     * - healthy: < 70%
     * - degraded: 70-90%
     * - unhealthy: > 90%
     */
    check(): ComponentHealth;
    /**
     * Определяет лимит памяти
     *
     * @remarks
     * Пытается получить из cgroup или возвращает дефолт 2GB.
     */
    private detectMemoryLimit;
}
