/**
 * Recorder для метрик Circuit Breaker
 *
 * @remarks
 * Infrastructure Layer — Metrics Recorder в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за запись метрик в IMetricsCollectorPort.
 *
 * Следует SRP: ответственен только за запись метрик.
 * Следует Observer Pattern: записывает метрики при событиях.
 */

import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';

/**
 * Recorder для метрик Circuit Breaker
 *
 * @remarks
 * Обёртка над IMetricsCollectorPort для записи метрик CB.
 * Все методы безопасны — если metrics не установлен, ничего не происходит.
 */
export class CircuitBreakerMetricsRecorder {
  constructor(
    private readonly metrics?: IMetricsCollectorPort
  ) {}

  /**
   * Записывает метрику изменения состояния
   *
   * @param breakerName - Имя circuit breaker
   * @param state - Новое состояние
   */
  recordStateChange(breakerName: string, state: CircuitState): void {
    if (!this.metrics) {
      return;
    }

    const stateValue = this.stateToValue(state);
    this.metrics.recordGauge(
      'circuit.state',
      stateValue,
      { circuit: breakerName }
    );
  }

  /**
   * Записывает метрику успешного выполнения
   *
   * @param breakerName - Имя circuit breaker
   */
  recordSuccess(breakerName: string): void {
    if (!this.metrics) {
      return;
    }

    this.metrics.recordCounter(
      'circuit.success',
      1,
      { circuit: breakerName }
    );
  }

  /**
   * Записывает метрику неудачного выполнения
   *
   * @param breakerName - Имя circuit breaker
   * @param error - Ошибка
   */
  recordFailure(breakerName: string, error: Error): void {
    if (!this.metrics) {
      return;
    }

    this.metrics.recordCounter(
      'circuit.failure',
      1,
      { circuit: breakerName, error: error.name }
    );
  }

  /**
   * Записывает метрику заблокированного запроса
   *
   * @param breakerName - Имя circuit breaker
   */
  recordBlocked(breakerName: string): void {
    if (!this.metrics) {
      return;
    }

    this.metrics.recordCounter(
      'circuit.blocked',
      1,
      { circuit: breakerName }
    );
  }

  /**
   * Записывает метрику сброса
   *
   * @param breakerName - Имя circuit breaker
   */
  recordReset(breakerName: string): void {
    if (!this.metrics) {
      return;
    }

    this.metrics.recordCounter(
      'circuit.reset',
      1,
      { circuit: breakerName }
    );
  }

  /**
   * Проверяет, есть ли collector метрик
   *
   * @returns true если metrics collector установлен
   */
  hasMetrics(): boolean {
    return this.metrics !== undefined;
  }

  /**
   * Конвертирует состояние в числовое значение
   *
   * @param state - Состояние circuit breaker
   * @returns Числовое представление
   *
   * @remarks
   * closed = 0, half_open = 0.5, open = 1
   */
  private stateToValue(state: CircuitState): number {
    switch (state) {
      case CircuitState.CLOSED:
        return 0;
      case CircuitState.HALF_OPEN:
        return 0.5;
      case CircuitState.OPEN:
        return 1;
    }
  }
}
