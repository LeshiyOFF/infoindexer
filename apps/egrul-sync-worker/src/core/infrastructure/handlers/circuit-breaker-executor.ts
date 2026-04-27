/**
 * Executor для Circuit Breaker
 *
 * @remarks
 * Infrastructure Layer — Executor в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает за логику выполнения функций через Circuit Breaker.
 *
 * Следует SRP: ответственен только за выполнение функций.
 */

import type {
  CircuitResult,
  CircuitError
} from '../../ports/i-circuit-breaker.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';
import { CircuitStateStorage } from '../adapters/circuit-state-storage';
import { CircuitBreakerEventsEmitter } from './circuit-breaker-events-emitter';
import { CircuitBreakerMetricsRecorder } from './circuit-breaker-metrics-recorder';

/**
 * Executor для Circuit Breaker
 *
 * @remarks
 * Содержит логику выполнения функций с проверкой состояния.
 * Используется CircuitBreakerAdapter для делегирования.
 */
export class CircuitBreakerExecutor {
  constructor(
    private readonly breakerName: string,
    private readonly state: CircuitStateStorage,
    private readonly eventsEmitter: CircuitBreakerEventsEmitter,
    private readonly metricsRecorder: CircuitBreakerMetricsRecorder,
    private readonly now: () => number
  ) {}

  /**
   * Выполняет функцию с защитой Circuit Breaker
   *
   * @param fn - Функция для выполнения
   * @returns Результат выполнения
   *
   * @remarks
   * - Проверяет состояние перед выполнением
   * - Выполняет функцию если цепь закрыта
   * - Записывает результат/ошибку
   */
  async execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>> {
    const currentTime = this.now();

    // Проверка на timeout-based transition
    if (this.state.shouldAttemptTransition(currentTime)) {
      this.state.transitionTo(CircuitState.HALF_OPEN);
    }

    // Проверка: цепь разомкнута?
    if (this.state.currentState === CircuitState.OPEN) {
      this.metricsRecorder.recordBlocked(this.breakerName);
      return {
        success: false,
        state: CircuitState.OPEN,
        error: 'circuit_open'
      };
    }

    // Выполнение функции
    try {
      const value = await fn();
      return this.handleSuccess(value);
    } catch (error) {
      return this.handleFailure(currentTime, error as Error);
    }
  }

  /**
   * Выполняет функцию с fallback при ошибке
   *
   * @param fn - Основная функция
   * @param fallback - Fallback функция
   * @returns Результат выполнения или fallback
   *
   * @remarks
   * Если основная функция завершается ошибкой,
   * вызывается fallback с кодом ошибки.
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
   * Обрабатывает успешное выполнение
   *
   * @param value - Возвращаемое значение
   * @returns Результат с успехом
   *
   * @remarks
   * Записывает успех, проверяет на изменение состояния.
   */
  private handleSuccess<T>(value: T): CircuitResult<T> {
    const result = this.state.recordSuccess();
    this.metricsRecorder.recordSuccess(this.breakerName);

    if (result.transition && result.to) {
      this.state.transitionTo(result.to);
    }

    // Отправляем событие успеха (если есть подписчик)
    if (this.eventsEmitter.hasEvents()) {
      this.eventsEmitter.emitSuccess(
        this.breakerName,
        this.state.currentState,
        this.now(),
        this.state.successCount
      );
    }

    return {
      success: true,
      state: this.state.currentState,
      value
    };
  }

  /**
   * Обрабатывает неудачное выполнение
   *
   * @param currentTime - Текущее время
   * @param error - Ошибка
   * @returns Результат с ошибкой
   *
   * @remarks
   * Записывает неудачу, проверяет на изменение состояния.
   */
  private handleFailure(currentTime: number, error: Error): CircuitResult<never> {
    const result = this.state.recordFailure(currentTime);
    this.metricsRecorder.recordFailure(this.breakerName, error);

    if (result.transition && result.to) {
      this.state.transitionTo(result.to);
    }

    // Отправляем событие неудачи (если есть подписчик)
    if (this.eventsEmitter.hasEvents()) {
      this.eventsEmitter.emitFailure(
        this.breakerName,
        this.state.currentState,
        error,
        this.now(),
        this.state.failureCount,
        this.state.failures.length
      );
    }

    const isErrorStateOpen = this.state.currentState === CircuitState.OPEN;
    return {
      success: false,
      state: this.state.currentState,
      error: isErrorStateOpen ? 'circuit_open' : 'execution_failed'
    };
  }
}
