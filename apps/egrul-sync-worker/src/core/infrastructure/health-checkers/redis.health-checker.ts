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
export class RedisHealthChecker {
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
  async check(): Promise<ComponentHealth> {
    const startTime = Date.now();

    try {
      const { redisClient } = await import('shared');
      await redisClient.ping();
      const latency = Date.now() - startTime;

      return {
        name: 'redis',
        status: latency < 500 ? 'healthy' : 'degraded',
        checkedAt: Date.now(),
        message: `Latency: ${latency}ms`,
        metadata: { latency } as unknown as Readonly<Record<string, unknown>>
      };
    } catch (error) {
      return {
        name: 'redis',
        status: 'unhealthy',
        checkedAt: Date.now(),
        message: error instanceof Error ? error.message : 'Unknown error',
        metadata: { error: String(error) } as unknown as Readonly<Record<string, unknown>>
      };
    }
  }
}
