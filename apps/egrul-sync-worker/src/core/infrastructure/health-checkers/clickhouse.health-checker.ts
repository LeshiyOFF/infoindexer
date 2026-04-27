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
export class ClickHouseHealthChecker {
  constructor(private readonly client: ClickHouseClient) {}

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
  async check(): Promise<ComponentHealth> {
    const startTime = Date.now();

    try {
      await this.client.ping();
      const latency = Date.now() - startTime;

      return {
        name: 'clickhouse',
        status: latency < 1000 ? 'healthy' : 'degraded',
        checkedAt: Date.now(),
        message: `Latency: ${latency}ms`,
        metadata: { latency } as unknown as Readonly<Record<string, unknown>>
      };
    } catch (error) {
      return {
        name: 'clickhouse',
        status: 'unhealthy',
        checkedAt: Date.now(),
        message: error instanceof Error ? error.message : 'Unknown error',
        metadata: { error: String(error) } as unknown as Readonly<Record<string, unknown>>
      };
    }
  }
}
