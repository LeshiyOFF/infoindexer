"use strict";
/**
 * ClickHouse Health Checker
 *
 * @remarks
 * Infrastructure Layer — Health Checker в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за проверку здоровья ClickHouse.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseHealthChecker = void 0;
/**
 * Health Checker для ClickHouse
 *
 * @remarks
 * Проверяет доступность и latency ClickHouse.
 */
class ClickHouseHealthChecker {
    client;
    constructor(client) {
        this.client = client;
    }
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
    async check() {
        const startTime = Date.now();
        try {
            await this.client.ping();
            const latency = Date.now() - startTime;
            return {
                name: 'clickhouse',
                status: latency < 1000 ? 'healthy' : 'degraded',
                checkedAt: Date.now(),
                message: `Latency: ${latency}ms`,
                metadata: { latency }
            };
        }
        catch (error) {
            return {
                name: 'clickhouse',
                status: 'unhealthy',
                checkedAt: Date.now(),
                message: error instanceof Error ? error.message : 'Unknown error',
                metadata: { error: String(error) }
            };
        }
    }
}
exports.ClickHouseHealthChecker = ClickHouseHealthChecker;
