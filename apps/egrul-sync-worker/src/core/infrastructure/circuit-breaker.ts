/**
 * Circuit Breaker — Facade для обратной совместимости
 *
 * @remarks
 * Infrastructure Layer — Facade Pattern.
 * Обёртка над CircuitBreakerAdapter для сохранения обратной совместимости.
 *
 * @deprecated Рекомендуется использовать ICircuitBreakerPort напрямую
 * через CircuitBreakerAdapter или CircuitBreakerManagerService.
 *
 * Старый API остаётся работающим для существующего кода.
 * Новый код должен использовать Port interface.
 *
 * @example
 * ```ts
 * // Old API (still works)
 * const breaker = new CircuitBreaker(config);
 * const result = await breaker.execute(fn);
 *
 * // New API (recommended)
 * const breaker = new CircuitBreakerAdapter('name', config, metrics);
 * const result = await breaker.execute(fn);
 * ```
 */

import { CircuitBreakerAdapter } from './adapters/circuit-breaker.adapter';
import { CircuitBreakerConfigVO } from '../domain/value-objects/circuit-breaker-config.vo';
import type { CircuitBreakerConfig } from '../ports/i-circuit-breaker.port';
import type { CircuitState } from '../ports/i-circuit-breaker.port';
import type { CircuitResult } from '../ports/i-circuit-breaker.port';
import type { CircuitStats } from '../ports/i-circuit-breaker.port';
import type { IMetricsCollectorPort } from '../ports/i-metrics-collector.port';

/**
 * Конфигурация Circuit Breaker (legacy)
 *
 * @remarks
 * Сохранён для обратной совместимости.
 * @deprecated Используйте CircuitBreakerConfigVO или CircuitBreakerConfig
 */
export interface LegacyCircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly halfOpenTimeout: number;
  readonly openTimeout: number;
  readonly slidingWindowSize: number;
}

/**
 * Значения по умолчанию (legacy)
 *
 * @remarks
 * @deprecated Используйте CircuitBreakerConfigVO.default()
 */
export const DEFAULT_CIRCUIT_CONFIG: LegacyCircuitBreakerConfig = {
  failureThreshold: 5,
  halfOpenTimeout: 60000,
  openTimeout: 30000,
  slidingWindowSize: 10000
} as const;

/**
 * Circuit Breaker — Facade
 *
 * @remarks
 * Facade Pattern: предоставляет простой интерфейс к сложной подсистеме.
 * Делегирует выполнение CircuitBreakerAdapter.
 *
 * Сохраняет обратную совместимость со старым кодом.
 */
export class CircuitBreaker {
  private readonly adapter: CircuitBreakerAdapter;

  /**
   * Создаёт Circuit Breaker
   *
   * @param config - Конфигурация (legacy или новая)
   * @param now - Функция получения времени (для тестов)
   *
   * @remarks
   * Принимает как старую так и новую конфигурацию.
   * Автоматически конвертирует в новый формат.
   */
  constructor(
    config: LegacyCircuitBreakerConfig | CircuitBreakerConfig = DEFAULT_CIRCUIT_CONFIG,
    now?: () => number
  ) {
    const normalizedConfig = this.normalizeConfig(config);
    this.adapter = new CircuitBreakerAdapter('default', normalizedConfig, undefined, undefined, now);
  }

  /**
   * Текущее состояние
   *
   * @deprecated Используйте getState()
   */
  get currentState(): CircuitState {
    return this.adapter.getState();
  }

  /**
   * Возвращает текущее состояние
   *
   * @returns Текущее состояние circuit breaker
   */
  getState(): CircuitState {
    return this.adapter.getState();
  }

  /**
   * Выполняет функцию с защитой Circuit Breaker
   *
   * @param fn - Функция для выполнения
   * @returns Результат выполнения
   *
   * @remarks
   * Сохраняет старую сигнатуру для совместимости.
   */
  async execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>> {
    return this.adapter.execute(fn);
  }

  /**
   * Выполняет функцию с fallback при ошибке
   *
   * @param fn - Основная функция
   * @param fallback - Fallback функция
   * @returns Результат выполнения или fallback
   */
  async executeWithFallback<T>(
    fn: () => Promise<T>,
    fallback: (error: 'circuit_open' | 'execution_failed') => Promise<T>
  ): Promise<T> {
    return this.adapter.executeWithFallback(fn, fallback);
  }

  /**
   * Принудительный сброс
   */
  reset(): void {
    this.adapter.reset();
  }

  /**
   * Проверяет, может ли запрос быть выполнен
   *
   * @returns true если запрос может быть выполнен
   */
  canProceed(): boolean {
    return this.adapter.canProceed();
  }

  /**
   * Статистика для мониторинга
   *
   * @returns Статистика circuit breaker
   */
  getStats(): CircuitStats {
    return this.adapter.getStats();
  }

  /**
   * Нормализует конфигурацию в новый формат
   *
   * @param config - Старая или новая конфигурация
   * @returns Нормализованная конфигурация
   */
  private normalizeConfig(config: LegacyCircuitBreakerConfig | CircuitBreakerConfig): CircuitBreakerConfig {
    // Если есть successThreshold, значит это уже новый формат
    if ('successThreshold' in config) {
      return config as CircuitBreakerConfig;
    }

    // Конвертируем из старого формата
    return {
      failureThreshold: config.failureThreshold,
      openTimeout: config.openTimeout,
      halfOpenTimeout: config.halfOpenTimeout,
      slidingWindowSize: config.slidingWindowSize,
      halfOpenMaxCalls: 3,
      successThreshold: 2
    };
  }
}

// Re-export types for backward compatibility
export * from './circuit-breaker-types';
export * from './circuit-breaker-config';
export { CircuitStateStorage } from './circuit-breaker-state';
export { CircuitBreakerAdapter } from './adapters/circuit-breaker.adapter';
export { CircuitBreakerConfigVO } from '../domain/value-objects/circuit-breaker-config.vo';
export type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
export type { ICircuitBreakerEventsPort } from '../ports/i-circuit-breaker-events.port';
export type { CircuitBreakerManager } from '../domain/circuit-breaker-manager.service';
