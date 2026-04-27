/**
 * Handler для преобразования Circuit Breaker событий в метрики
 *
 * @remarks
 * Infrastructure Layer — Event Handler в Hexagonal Architecture.
 * Реализует ICircuitBreakerEventsPort для отправки метрик.
 *
 * Следует SRP: ответственен только за конвертацию событий в метрики.
 */

import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';
import type {
  StateChangeEvent,
  FailureEvent,
  SuccessEvent,
  ResetEvent
} from '../../ports/i-circuit-breaker-events.port';
import type { ICircuitBreakerEventsPort } from '../../ports/i-circuit-breaker-events.port';
import { CIRCUIT_BREAKER_METRICS } from '../constants/circuit-breaker-metrics.constants';
import { stateToValue } from '../utils/circuit-state.util';

// Re-export constants for backward compatibility
export { CIRCUIT_BREAKER_METRICS };

/**
 * Handler для преобразования событий в метрики
 *
 * @remarks
 * Реализует Observer Pattern для метрик.
 * Каждое событие circuit breaker преобразуется в соответствующие метрики.
 */
export class CircuitBreakerMetricsHandler implements ICircuitBreakerEventsPort {
  constructor(
    private readonly metrics: IMetricsCollectorPort
  ) {}

  onStateChange(event: StateChangeEvent): void {
    const tags = {
      circuit: event.breakerName,
      from: event.previousState,
      to: event.newState,
      reason: event.reason
    };

    this.metrics.recordCounter(CIRCUIT_BREAKER_METRICS.STATE_CHANGE, 1, tags);
    this.metrics.recordGauge(
      CIRCUIT_BREAKER_METRICS.STATE,
      stateToValue(event.newState),
      { circuit: event.breakerName }
    );
  }

  onFailure(event: FailureEvent): void {
    const baseTags = {
      circuit: event.breakerName,
      state: event.state,
      error_type: event.error.constructor.name
    };

    this.metrics.recordCounter(CIRCUIT_BREAKER_METRICS.FAILURE, 1, baseTags);
    this.metrics.recordGauge(
      CIRCUIT_BREAKER_METRICS.FAILURE_COUNT,
      event.failureCount,
      { circuit: event.breakerName }
    );
    this.metrics.recordGauge(
      CIRCUIT_BREAKER_METRICS.FAILURES_IN_WINDOW,
      event.failuresInWindow,
      { circuit: event.breakerName }
    );
  }

  onSuccess(event: SuccessEvent): void {
    const tags = {
      circuit: event.breakerName,
      state: event.state
    };

    this.metrics.recordCounter(CIRCUIT_BREAKER_METRICS.SUCCESS, 1, tags);
    this.metrics.recordGauge(
      CIRCUIT_BREAKER_METRICS.SUCCESS_COUNT,
      event.successCount,
      { circuit: event.breakerName }
    );
  }

  onReset(event: ResetEvent): void {
    const tags = {
      circuit: event.breakerName,
      from: event.previousState
    };

    this.metrics.recordCounter(CIRCUIT_BREAKER_METRICS.RESET, 1, tags);
    this.metrics.recordGauge(
      CIRCUIT_BREAKER_METRICS.STATE,
      0,
      { circuit: event.breakerName }
    );
  }
}
