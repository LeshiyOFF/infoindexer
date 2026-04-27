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
import type { StateChangeEvent, FailureEvent, SuccessEvent, ResetEvent } from '../../ports/i-circuit-breaker-events.port';
import type { ICircuitBreakerEventsPort } from '../../ports/i-circuit-breaker-events.port';
import { CIRCUIT_BREAKER_METRICS } from '../constants/circuit-breaker-metrics.constants';
export { CIRCUIT_BREAKER_METRICS };
/**
 * Handler для преобразования событий в метрики
 *
 * @remarks
 * Реализует Observer Pattern для метрик.
 * Каждое событие circuit breaker преобразуется в соответствующие метрики.
 */
export declare class CircuitBreakerMetricsHandler implements ICircuitBreakerEventsPort {
    private readonly metrics;
    constructor(metrics: IMetricsCollectorPort);
    onStateChange(event: StateChangeEvent): void;
    onFailure(event: FailureEvent): void;
    onSuccess(event: SuccessEvent): void;
    onReset(event: ResetEvent): void;
}
