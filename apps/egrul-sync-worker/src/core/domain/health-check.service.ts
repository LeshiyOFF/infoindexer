/**
 * Health Check Service
 *
 * @remarks
 * Domain Layer — Service в Hexagonal Architecture.
 * Агрегирует health статус всех компонентов системы.
 * Предоставляет единый API для мониторинга здоровья.
 *
 * Следует SRP: ответственен только за агрегацию health статуса.
 * Следует Delegation: делегирует проверку специализированным checker'ам.
 */

import type { ICircuitBreakerManagerPort } from '../ports/i-circuit-breaker-manager.port';
import type {
  HealthReport,
  HealthStatus,
  HealthComponents,
  ComponentHealth
} from './types/health.types';
import type { CircuitBreakerHealth } from './types/circuit-breaker-health.types';
import { ClickHouseHealthChecker } from '../infrastructure/health-checkers/clickhouse.health-checker';
import { RedisHealthChecker } from '../infrastructure/health-checkers/redis.health-checker';
import { MemoryHealthChecker } from '../infrastructure/health-checkers/memory.health-checker';

/**
 * Health Check Service
 *
 * @remarks
 * Агрегирует состояние:
 * - ClickHouse (через ClickHouseHealthChecker)
 * - Circuit Breaker (напрямую из manager)
 * - Redis (через RedisHealthChecker)
 * - Memory (через MemoryHealthChecker)
 */
export class HealthCheckService {
  private readonly clickhouseChecker: ClickHouseHealthChecker;
  private readonly redisChecker: RedisHealthChecker;
  private readonly memoryChecker: MemoryHealthChecker;

  constructor(
    private readonly circuitBreakerManager: ICircuitBreakerManagerPort,
    clickhouseClient: import('@clickhouse/client').ClickHouseClient
  ) {
    this.clickhouseChecker = new ClickHouseHealthChecker(clickhouseClient);
    this.redisChecker = new RedisHealthChecker();
    this.memoryChecker = new MemoryHealthChecker();
  }

  /**
   * Возвращает полный отчёт о здоровье системы
   *
   * @remarks
   * Асинхронная проверка всех компонентов.
   */
  async getFullHealth(): Promise<HealthReport> {
    const timestamp = Date.now();
    const uptime = process.uptime() * 1000;

    const components = await this.checkAllComponents();
    const status = this.aggregateStatus(components);
    const activeOperations = this.countActiveOperations();

    return {
      status,
      timestamp,
      uptime,
      components,
      activeOperations,
      version: this.getVersion()
    };
  }

  /**
   * Возвращает health статус circuit breaker
   *
   * @remarks
   * Синхронная операция (без внешних вызовов).
   */
  getCircuitBreakerHealth(): CircuitBreakerHealth {
    return this.circuitBreakerManager.getHealth();
  }

  /**
   * Проверяет все компоненты
   *
   * @remarks
   * Параллельная проверка для минимизации времени.
   */
  private async checkAllComponents(): Promise<HealthComponents> {
    const [clickhouse, redis, memory] = await Promise.all([
      this.clickhouseChecker.check().catch(() => undefined),
      this.redisChecker.check().catch(() => undefined),
      Promise.resolve(this.memoryChecker.check())
    ]);

    const circuitBreaker = this.checkCircuitBreaker();

    return {
      clickhouse,
      redis,
      memory,
      circuitBreaker
    };
  }

  /**
   * Проверяет Circuit Breaker
   *
   * @remarks
   * Синхронная проверка (без внешних вызовов).
   */
  private checkCircuitBreaker(): ComponentHealth {
    const health = this.circuitBreakerManager.getHealth();
    const status = this.calculateCircuitBreakerStatus(health);

    return {
      name: 'circuit-breaker',
      status,
      checkedAt: Date.now(),
      metadata: {
        total: health.total,
        closed: health.closed,
        open: health.open,
        halfOpen: health.halfOpen,
        openBreakers: this.circuitBreakerManager.getOpenBreakers()
      } as unknown as Readonly<Record<string, unknown>>
    };
  }

  /**
   * Агрегирует общий статус из компонентов
   *
   * @remarks
   * Общий статус = худший из компонентов.
   */
  private aggregateStatus(components: HealthComponents): HealthStatus {
    const statuses: HealthStatus[] = Object.values(components).filter(
      (c): c is ComponentHealth => c !== undefined
    ).map(c => c.status);

    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    }
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Вычисляет статус circuit breaker
   *
   * @remarks
   * unhealthy = есть открытые breaker
   * degraded = есть half-open breaker
   * healthy = все закрыты
   */
  private calculateCircuitBreakerStatus(health: CircuitBreakerHealth): HealthStatus {
    if (health.open > 0) {
      return 'unhealthy';
    }
    if (health.halfOpen > 0) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Подсчитывает активные операции
   *
   * @remarks
   * Заглушка для совместимости с AppState.
   */
  private countActiveOperations(): number {
    try {
      const { getActiveOperations } = require('../shutdown-handlers');
      return getActiveOperations().size;
    } catch {
      return 0;
    }
  }

  /**
   * Возвращает версию приложения
   *
   * @remarks
   * Из package.json или дефолт.
   */
  private getVersion(): string {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pkg = require('../../package.json');
      return pkg.version || '0.0.0';
    } catch {
      return '0.0.0';
    }
  }
}
