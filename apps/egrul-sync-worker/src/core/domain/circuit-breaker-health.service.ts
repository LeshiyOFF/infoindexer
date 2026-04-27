/**
 * Health Checker для Circuit Breaker
 *
 * @remarks
 * Domain Layer — Service в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за агрегацию health статуса.
 *
 * Следует SRP: ответственен только за health check.
 */

import type { CircuitStats } from '../ports/i-circuit-breaker.port';
import { CircuitState } from '../ports/i-circuit-breaker.port';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import type { CircuitBreakerHealth } from './types/circuit-breaker-health.types';

/**
 * Health Checker для Circuit Breaker
 *
 * @remarks
 * Агрегирует состояние всех circuit breaker для health check.
 * Предоставляет методы для проверки состояния.
 */
export class CircuitBreakerHealthChecker {
  constructor(
    private readonly getBreakers: () => Map<string, ICircuitBreakerPort>
  ) {}

  /**
   * Возвращает агрегированный health status
   *
   * @returns Health status всех breaker
   *
   * @remarks
   * Подсчитывает количество breaker в каждом состоянии.
   */
  getHealth(): CircuitBreakerHealth {
    let closed = 0;
    let open = 0;
    let halfOpen = 0;
    const details = new Map<string, CircuitStats>();

    this.getBreakers().forEach((breaker, name) => {
      const stats = breaker.getStats();
      details.set(name, stats);

      switch (stats.state) {
        case CircuitState.CLOSED:
          closed++;
          break;
        case CircuitState.OPEN:
          open++;
          break;
        case CircuitState.HALF_OPEN:
          halfOpen++;
          break;
      }
    });

    return {
      total: this.getBreakers().size,
      closed,
      open,
      halfOpen,
      details
    };
  }

  /**
   * Возвращает статистику по всем breaker
   *
   * @returns Map имя → статистика
   */
  getAllStats(): Map<string, CircuitStats> {
    const result = new Map<string, CircuitStats>();
    this.getBreakers().forEach((breaker, name) => {
      result.set(name, breaker.getStats());
    });
    return result;
  }

  /**
   * Проверяет что все breaker в CLOSED состоянии
   *
   * @returns true если все breaker закрыты
   */
  isAllClosed(): boolean {
    return this.getHealth().open === 0 &&
           this.getHealth().halfOpen === 0;
  }

  /**
   * Возвращает имена breaker в OPEN состоянии
   *
   * @returns Массив имён
   */
  getOpenBreakers(): string[] {
    const result: string[] = [];
    this.getBreakers().forEach((breaker, name) => {
      if (breaker.getState() === CircuitState.OPEN) {
        result.push(name);
      }
    });
    return result;
  }
}
