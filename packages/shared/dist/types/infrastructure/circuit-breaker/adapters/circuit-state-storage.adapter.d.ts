/**
 * Circuit Breaker State Storage
 *
 * @remarks
 * Infrastructure Layer — State Storage in Hexagonal Architecture.
 * Extracted for SRP: Stores mutable state, isolated from adapter.
 *
 * Follows SRP: Responsible only for state storage and transitions.
 * Follows State Machine Pattern: CLOSED → OPEN → HALF_OPEN → CLOSED.
 */
import type { CircuitBreakerConfig } from '../domain/types/circuit-breaker.types';
import { CircuitState } from '../domain/types/circuit-breaker.types';
import type { StateChangeReason } from '../ports/i-circuit-breaker-events.port';
/**
 * State transition result
 *
 * @remarks
 * Value Object with readonly properties.
 * Returned when circuit breaker state changes.
 */
export interface StateTransitionResult {
    /** Whether transition occurred */
    readonly transition: boolean;
    /** New state (if changed) */
    readonly to?: CircuitState;
    /** Reason for change */
    readonly reason?: StateChangeReason;
}
/**
 * Circuit Breaker State Storage
 *
 * @remarks
 * Thread-safety: Not guaranteed for concurrent access.
 * Uses sliding window for failure tracking.
 */
export declare class CircuitStateStorage {
    private readonly config;
    private readonly now;
    /** Current state */
    currentState: CircuitState;
    /** Failures in current window */
    failureCount: number;
    /** Consecutive successes */
    successCount: number;
    /** Last failure timestamp */
    lastFailureTime: number;
    /** Last state change timestamp */
    readonly lastStateChange: number;
    /** Next attempt timestamp */
    nextAttemptTime: number;
    /** Calls in HALF_OPEN state */
    halfOpenCalls: number;
    /** Sliding window of failures (timestamps) */
    readonly failures: number[];
    constructor(config: CircuitBreakerConfig, now: () => number);
    /**
     * Check if transition should be attempted
     *
     * @param currentTime - Current timestamp
     * @returns true if should attempt
     *
     * @remarks
     * In OPEN state, checks timeout.
     */
    shouldAttemptTransition(currentTime: number): boolean;
    /**
     * Record successful execution
     *
     * @returns State transition result
     *
     * @remarks
     * HALF_OPEN: After successThreshold successes → CLOSED
     * CLOSED: Just increments success counter
     */
    recordSuccess(): StateTransitionResult;
    /**
     * Record failed execution
     *
     * @param currentTime - Current timestamp
     * @returns State transition result
     *
     * @remarks
     * CLOSED: After failureThreshold failures → OPEN
     * HALF_OPEN: Any failure → OPEN
     */
    recordFailure(currentTime: number): StateTransitionResult;
    /**
     * Transition to new state
     *
     * @param newState - New state
     *
     * @remarks
     * Updates lastStateChange on transition.
     */
    transitionTo(newState: CircuitState): void;
    /**
     * Reset to initial state
     *
     * @remarks
     * Used for manual recovery.
     */
    reset(): void;
    /**
     * Remove stale failure records
     *
     * @param currentTime - Current timestamp
     *
     * @remarks
     * Removes records older than slidingWindowSize.
     */
    private cleanOldFailures;
    /**
     * Check if circuit should open
     *
     * @returns true if should open
     *
     * @remarks
     * Checks failure threshold.
     */
    private shouldOpenCircuit;
    /**
     * Get statistics for monitoring
     *
     * @returns Circuit breaker statistics
     */
    getStats(): import('../domain/types/circuit-breaker.types').CircuitStats;
}
