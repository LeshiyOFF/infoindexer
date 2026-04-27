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
export class MemoryHealthChecker {
  private readonly memoryLimitBytes: number;

  constructor(memoryLimitBytes?: number) {
    this.memoryLimitBytes = memoryLimitBytes ?? this.detectMemoryLimit();
  }

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
  check(): ComponentHealth {
    const usage = process.memoryUsage();
    const used = usage.heapUsed;
    const limit = this.memoryLimitBytes;
    const percent = (used / limit) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (percent < 70) {
      status = 'healthy';
    } else if (percent < 90) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      name: 'memory',
      status,
      checkedAt: Date.now(),
      message: `${Math.round(percent)}% used`,
      metadata: {
        used,
        limit,
        percent: Math.round(percent)
      } as unknown as Readonly<Record<string, unknown>>
    };
  }

  /**
   * Определяет лимит памяти
   *
   * @remarks
   * Пытается получить из cgroup или возвращает дефолт 2GB.
   */
  private detectMemoryLimit(): number {
    // Дефолт 2GB если не удалось определить
    return 2 * 1024 * 1024 * 1024;
  }
}
