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
export declare class CircuitBreakerMetricsRecorder {
    private readonly enabled;
    constructor(enabled?: boolean);
    /**
     * Record state change metric
     *
     * @param breakerName - Circuit breaker name
     * @param state - New state
     */
    recordStateChange(breakerName: string, state: CircuitState): void;
    /**
     * Record success metric
     *
     * @param breakerName - Circuit breaker name
     */
    recordSuccess(breakerName: string): void;
    /**
     * Record failure metric
     *
     * @param breakerName - Circuit breaker name
     * @param error - Error
     */
    recordFailure(breakerName: string, error: Error): void;
    /**
     * Record blocked request metric
     *
     * @param breakerName - Circuit breaker name
     */
    recordBlocked(breakerName: string): void;
    /**
     * Record reset metric
     *
     * @param breakerName - Circuit breaker name
     */
    recordReset(breakerName: string): void;
    /**
     * Check if metrics recorder is enabled
     *
     * @returns true if metrics enabled
     */
    hasMetrics(): boolean;
    /**
     * Convert state to numeric value
     *
     * @param state - Circuit breaker state
     * @returns Numeric representation
     *
     * @remarks
     * closed = 0, half_open = 0.5, open = 1
     */
    private stateToValue;
}
