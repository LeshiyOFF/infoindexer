/**
 * ClickHouse Health Checker
 *
 * @remarks
 * Infrastructure Layer — Health Checker в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за проверку здоровья ClickHouse.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { ComponentHealth } from '../../domain/types/health.types';
/**
 * Health Checker для ClickHouse
 *
 * @remarks
 * Проверяет доступность и latency ClickHouse.
 */
export declare class ClickHouseHealthChecker {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Проверяет здоровье ClickHouse
     *
     * @returns Статус компонента
     *
     * @remarks
     * - healthy: latency < 1000ms
     * - degraded: latency >= 1000ms
     * - unhealthy: ошибка подключения
     */
    check(): Promise<ComponentHealth>;
}
