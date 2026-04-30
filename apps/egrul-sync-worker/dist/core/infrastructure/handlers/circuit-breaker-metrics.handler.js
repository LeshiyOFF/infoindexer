"use strict";
/**
 * Handler для преобразования Circuit Breaker событий в метрики
 *
 * @remarks
 * Infrastructure Layer — Event Handler в Hexagonal Architecture.
 * Реализует ICircuitBreakerEventsPort для отправки метрик.
 *
 * Следует SRP: ответственен только за конвертацию событий в метрики.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerMetricsHandler = exports.CIRCUIT_BREAKER_METRICS = void 0;
const circuit_breaker_metrics_constants_1 = require("../constants/circuit-breaker-metrics.constants");
Object.defineProperty(exports, "CIRCUIT_BREAKER_METRICS", { enumerable: true, get: function () { return circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS; } });
const circuit_state_util_1 = require("../utils/circuit-state.util");
/**
 * Handler для преобразования событий в метрики
 *
 * @remarks
 * Реализует Observer Pattern для метрик.
 * Каждое событие circuit breaker преобразуется в соответствующие метрики.
 */
class CircuitBreakerMetricsHandler {
    metrics;
    constructor(metrics) {
        this.metrics = metrics;
    }
    onStateChange(event) {
        const tags = {
            circuit: event.breakerName,
            from: event.previousState,
            to: event.newState,
            reason: event.reason
        };
        this.metrics.recordCounter(circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS.STATE_CHANGE, 1, tags);
        this.metrics.recordGauge(circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS.STATE, (0, circuit_state_util_1.stateToValue)(event.newState), { circuit: event.breakerName });
    }
    onFailure(event) {
        const baseTags = {
            circuit: event.breakerName,
            state: event.state,
            error_type: event.error.constructor.name
        };
        this.metrics.recordCounter(circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS.FAILURE, 1, baseTags);
        this.metrics.recordGauge(circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS.FAILURE_COUNT, event.failureCount, { circuit: event.breakerName });
        this.metrics.recordGauge(circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS.FAILURES_IN_WINDOW, event.failuresInWindow, { circuit: event.breakerName });
    }
    onSuccess(event) {
        const tags = {
            circuit: event.breakerName,
            state: event.state
        };
        this.metrics.recordCounter(circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS.SUCCESS, 1, tags);
        this.metrics.recordGauge(circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS.SUCCESS_COUNT, event.successCount, { circuit: event.breakerName });
    }
    onReset(event) {
        const tags = {
            circuit: event.breakerName,
            from: event.previousState
        };
        this.metrics.recordCounter(circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS.RESET, 1, tags);
        this.metrics.recordGauge(circuit_breaker_metrics_constants_1.CIRCUIT_BREAKER_METRICS.STATE, 0, { circuit: event.breakerName });
    }
}
exports.CircuitBreakerMetricsHandler = CircuitBreakerMetricsHandler;
