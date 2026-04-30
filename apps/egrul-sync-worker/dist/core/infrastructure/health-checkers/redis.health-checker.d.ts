/**
 * Redis Health Checker
 *
 * @remarks
 * Infrastructure Layer — Health Checker в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за проверку здоровья Redis.
 */
import type { ComponentHealth } from '../../domain/types/health.types';
/**
 * Health Checker для Redis
 *
 * @remarks
 * Проверяет доступность и latency Redis.
 */
export declare class RedisHealthChecker {
    /**
     * Проверяет здоровье Redis
     *
     * @returns Статус компонента
     *
     * @remarks
     * - healthy: latency < 500ms
     * - degraded: latency >= 500ms
     * - unhealthy: ошибка подключения
     */
    check(): Promise<ComponentHealth>;
}
