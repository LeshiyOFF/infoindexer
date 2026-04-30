/**
 * Circuit Breaker Metrics Recorder
 *
 * @remarks
 * Infrastructure Layer — Metrics Recorder in Hexagonal Architecture.
 * Extracted for SRP: Responsible only for metrics recording.
 *
 * Follows SRP: Responsible only for metrics recording.
 * Follows Observer Pattern: Records metrics on events.
 *
 * Simple console-based implementation. For production, replace with
 * Prometheus/Datadog adapter.
 */
import { CircuitState } from '../domain/types/circuit-breaker.types';
/**
 * Circuit Breaker Metrics Recorder
 *
 * @remarks
 * Simple console-based metrics recorder.
 * All methods safe — if metrics disabled, nothing happens.
 *
 * For production, implement with Prometheus/StatsD.
 */
export class CircuitBreakerMetricsRecorder {
    enabled;
    constructor(enabled = true) {
        this.enabled = enabled;
    }
    /**
     * Record state change metric
     *
     * @param breakerName - Circuit breaker name
     * @param state - New state
     */
    recordStateChange(breakerName, state) {
        if (!this.enabled) {
            return;
        }
        const stateValue = this.stateToValue(state);
        console.log(`[CIRCUIT_METRICS] ${breakerName} state=${stateValue}`);
    }
    /**
     * Record success metric
     *
     * @param breakerName - Circuit breaker name
     */
    recordSuccess(breakerName) {
        if (!this.enabled) {
            return;
        }
        console.log(`[CIRCUIT_METRICS] ${breakerName} success=1`);
    }
    /**
     * Record failure metric
     *
     * @param breakerName - Circuit breaker name
     * @param error - Error
     */
    recordFailure(breakerName, error) {
        if (!this.enabled) {
            return;
        }
        console.log(`[CIRCUIT_METRICS] ${breakerName} failure=1 error=${error.name}`);
    }
    /**
     * Record blocked request metric
     *
     * @param breakerName - Circuit breaker name
     */
    recordBlocked(breakerName) {
        if (!this.enabled) {
            return;
        }
        console.log(`[CIRCUIT_METRICS] ${breakerName} blocked=1`);
    }
    /**
     * Record reset metric
     *
     * @param breakerName - Circuit breaker name
     */
    recordReset(breakerName) {
        if (!this.enabled) {
            return;
        }
        console.log(`[CIRCUIT_METRICS] ${breakerName} reset=1`);
    }
    /**
     * Check if metrics recorder is enabled
     *
     * @returns true if metrics enabled
     */
    hasMetrics() {
        return this.enabled;
    }
    /**
     * Convert state to numeric value
     *
     * @param state - Circuit breaker state
     * @returns Numeric representation
     *
     * @remarks
     * closed = 0, half_open = 0.5, open = 1
     */
    stateToValue(state) {
        switch (state) {
            case CircuitState.CLOSED:
                return 0;
            case CircuitState.HALF_OPEN:
                return 0.5;
            case CircuitState.OPEN:
                return 1;
            default:
                return 0;
        }
    }
}
