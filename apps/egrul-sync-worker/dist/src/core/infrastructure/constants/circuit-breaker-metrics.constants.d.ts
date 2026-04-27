/**
 * Константы для Circuit Breaker Metrics
 *
 * @remarks
 * Infrastructure Layer — Constants в Hexagonal Architecture.
 * Содержит имена метрик для Circuit Breaker.
 */
/**
 * Константы для имён метрик
 *
 * @remarks
 * Value Object: неизменяемый (as const).
 */
export declare const CIRCUIT_BREAKER_METRICS: {
    readonly STATE_CHANGE: "circuit.state_change";
    readonly STATE: "circuit.state";
    readonly SUCCESS: "circuit.success";
    readonly FAILURE: "circuit.failure";
    readonly BLOCKED: "circuit.blocked";
    readonly RESET: "circuit.reset";
    readonly HALF_OPEN_CALLS: "circuit.half_open_calls";
    readonly FAILURE_COUNT: "circuit.failure_count";
    readonly SUCCESS_COUNT: "circuit.success_count";
    readonly FAILURES_IN_WINDOW: "circuit.failures_in_window";
    readonly LAST_FAILURE_AGE: "circuit.last_failure_age";
    readonly STATE_DURATION: "circuit.state_duration";
};
