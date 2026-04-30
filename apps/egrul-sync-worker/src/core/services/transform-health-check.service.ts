/**
 * Transform Health Check Service
 *
 * @remarks
 * Сервис для проверки здоровья transform операций.
 * Следует SRP: только проверка, не лечение.
 * Следует DIP: зависит от портов, не от конкретных адаптеров.
 *
 * @pattern Single Responsibility Principle
 * @pattern Dependency Inversion Principle
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IHealthCheck, SystemHealthResult } from '../domain/ports/i-health-check.port';
import type { ComponentHealth } from '../domain/types/health.types';
import { HealthCheckDto } from '../domain/dto/health-check.dto';
import type { IMemoryMonitor } from '../domain/ports/i-memory-monitor.port';

/**
 * Checker function для отдельного компонента
 *
 * @remarks
 * Тип для функции проверки компонента.
 */
type ComponentChecker = () => Promise<ComponentHealth>;

/**
 * Health Check Service
 *
 * @remarks
 * Реализует IHealthCheck порт.
 * Проверяет критические компоненты системы.
 */
export class TransformHealthCheckService implements IHealthCheck {
  private readonly checkers: Map<string, ComponentChecker>;

  constructor(
    private readonly clickhouse: ClickHouseClient,
    private readonly memoryMonitor: IMemoryMonitor
  ) {
    this.checkers = new Map();
    this.registerDefaultCheckers();
  }

  /**
   * Проверить здоровье всех компонентов
   *
   * @remarks
   * Выполняет все зарегистрированные проверки параллельно.
   *
   * @returns Агрегированный результат health check
   */
  async check(): Promise<SystemHealthResult> {
    const checkerEntries = Array.from(this.checkers.entries());

    // Параллельное выполнение всех проверок
    const results = await Promise.all(
      checkerEntries.map(async ([name, checker]) => {
        try {
          return await checker();
        } catch (error) {
          return HealthCheckDto.unhealthy(
            name,
            0,
            error instanceof Error ? error : String(error)
          );
        }
      })
    );

    return HealthCheckDto.systemResult(results);
  }

  /**
   * Проверить здоровье конкретного компонента
   *
   * @param name - Имя компонента
   * @returns Результат health check компонента
   */
  async checkComponent(name: string): Promise<ComponentHealth> {
    const checker = this.checkers.get(name);
    if (!checker) {
      throw new Error(`Component checker not found: ${name}`);
    }

    try {
      return await checker();
    } catch (error) {
      return HealthCheckDto.unhealthy(
        name,
        0,
        error instanceof Error ? error : String(error)
      );
    }
  }

  /**
   * Зарегистрировать компонент для проверки
   *
   * @param name - Уникальное имя компонента
   * @param checker - Функция проверки компонента
   */
  register(name: string, checker: () => Promise<ComponentHealth>): void {
    if (this.checkers.has(name)) {
      throw new Error(`Component already registered: ${name}`);
    }
    this.checkers.set(name, checker);
  }

  /**
   * Зарегистрировать checker'ы по умолчанию
   *
   * @remarks
   * Регистрирует проверки для ClickHouse, Redis, Memory.
   */
  private registerDefaultCheckers(): void {
    this.register('clickhouse', this.checkClickHouse.bind(this));
    this.register('memory', this.checkMemory.bind(this));
  }

  /**
   * Проверить ClickHouse
   *
   * @returns Результат проверки
   */
  private async checkClickHouse(): Promise<ComponentHealth> {
    const start = Date.now();

    try {
      const result = await this.clickhouse.query({
        query: 'SELECT 1',
        format: 'JSONEachRow'
      });

      // Consuming the result to ensure query executed
      await result.text();

      return HealthCheckDto.healthy('clickhouse', Date.now() - start);
    } catch (error) {
      return HealthCheckDto.unhealthy(
        'clickhouse',
        Date.now() - start,
        error instanceof Error ? error : String(error)
      );
    }
  }

  /**
   * Проверить память
   *
   * @remarks
   * Проверяет доступность памяти и использование.
   *
   * @returns Результат проверки
   */
  private async checkMemory(): Promise<ComponentHealth> {
    const start = Date.now();

    try {
      const snapshot = await this.memoryMonitor.getMemorySnapshot();
      const duration = Date.now() - start;

      // Статус зависит от использования памяти
      if (snapshot.usagePercent > 90) {
        return HealthCheckDto.degraded(
          'memory',
          duration,
          `High memory usage: ${snapshot.usagePercent.toFixed(1)}%`,
          {
            used_mb: Math.round(snapshot.usedBytes / 1024 / 1024),
            available_mb: Math.round(snapshot.availableBytes / 1024 / 1024),
            usage_percent: Math.round(snapshot.usagePercent)
          }
        );
      }

      return HealthCheckDto.healthy('memory', duration, {
        used_mb: Math.round(snapshot.usedBytes / 1024 / 1024),
        available_mb: Math.round(snapshot.availableBytes / 1024 / 1024),
        usage_percent: Math.round(snapshot.usagePercent)
      });
    } catch (error) {
      return HealthCheckDto.unhealthy(
        'memory',
        Date.now() - start,
        error instanceof Error ? error : String(error)
      );
    }
  }
}
