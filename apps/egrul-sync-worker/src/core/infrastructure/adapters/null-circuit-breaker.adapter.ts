/**
 * Null Object Pattern для Circuit Breaker
 *
 * @remarks
 * Infrastructure Layer — Adapter в Hexagonal Architecture.
 * Реализует ICircuitBreakerPort с zero overhead.
 *
 * Всегда в CLOSED состоянии, все запросы выполняются напрямую.
 * Используется когда circuit breaker отключён конфигурацией.
 *
 * Следует Null Object Pattern: no-op реализация интерфейса.
 * Следует SRP: ответственен только за делегирование.
 *
 * @example
 * ```ts
 * const breaker = ENABLE_CIRCUIT_BREAKER
 *   ? new CircuitBreakerAdapter(name, config, metrics)
 *   : new NullCircuitBreakerAdapter();
 * ```
 */

import type {
  CircuitResult,
  CircuitStats,
  CircuitError
} from '../../ports/i-circuit-breaker.port';
import type { ICircuitBreakerPort } from '../../ports/i-circuit-breaker.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';

/**
 * Константы для Null Circuit Breaker
 *
 * @remarks
 * Immutable значения для статистики.
 */
const NULL_STATS: CircuitStats = {
  state: CircuitState.CLOSED,
  failureCount: 0,
  successCount: 0,
  failuresInWindow: 0,
  lastFailureTime: 0,
  lastStateChange: 0,
  nextAttemptTime: 0
} as const;

/**
 * Null Object для Circuit Breaker
 *
 * @remarks
 * Всегда выполняет функцию, никогда не блокирует.
 * Zero overhead: никаких проверок, никакого состояния.
 *
 * Используется когда:
 * - Circuit breaker отключён globally
 * - Для определённых сервисов где CB не нужен
 * - В тестах для mocking
 */
export class NullCircuitBreakerAdapter implements ICircuitBreakerPort {
  constructor(
    public readonly breakerName: string = 'null'
  ) {}

  /**
   * Выполняет функцию напрямую без защиты
   *
   * @param fn - Функция для выполнения
   * @returns Результат выполнения
   *
   * @remarks
   * Никогда не блокирует, всегда выполняет fn.
   * При ошибке пробрасывает exception.
   */
  async execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>> {
    try {
      const value = await fn();
      return {
        success: true,
        state: CircuitState.CLOSED,
        value
      };
    } catch (error) {
      return {
        success: false,
        state: CircuitState.CLOSED,
        error: 'execution_failed'
      };
    }
  }

  /**
   * Выполняет функцию с fallback
   *
   * @param fn - Основная функция
   * @param fallback - Fallback функция
   * @returns Результат выполнения или fallback
   *
   * @remarks
   * Сначала пытается выполнить fn, при ошибке вызывает fallback.
   */
  async executeWithFallback<T>(
    fn: () => Promise<T>,
    fallback: (error: CircuitError) => Promise<T>
  ): Promise<T> {
    const result = await this.execute(fn);

    if (result.success) {
      return result.value;
    }

    return fallback(result.error);
  }

  /**
   * Всегда возвращает CLOSED
   *
   * @returns CircuitState.CLOSED
   */
  getState(): CircuitState {
    return CircuitState.CLOSED;
  }

  /**
   * Возвращает пустую статистику
   *
   * @returns Статистика с нулевыми значениями
   */
  getStats(): CircuitStats {
    return NULL_STATS;
  }

  /**
   * Ничего не делает (no-op)
   *
   * @remarks
   * Null Object pattern: метод существует но ничего не делает.
   */
  reset(): void {
    // No-op
  }

  /**
   * Всегда возвращает true
   *
   * @returns true
   *
   * @remarks
   * Никогда не блокирует выполнение.
   */
  canProceed(): boolean {
    return true;
  }
}

/**
 * Синглтон экземпляр для переиспользования
 *
 * @remarks
 * Можно использовать один экземпляр везде,
 * так как состояние не изменяется.
 */
export const NULL_CIRCUIT_BREAKER = new NullCircuitBreakerAdapter();
