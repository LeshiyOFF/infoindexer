/**
 * Circuit Breaker Events Emitter
 *
 * @remarks
 * Infrastructure Layer — Event Emitter in Hexagonal Architecture.
 * Extracted for SRP: Responsible only for emitting events.
 *
 * Follows SRP: Responsible only for event emission.
 * Follows Observer Pattern: Notifies subscribers.
 */
import type { ICircuitBreakerEventsPort } from '../ports/i-circuit-breaker-events.port';
import { CircuitState } from '../domain/types/circuit-breaker.types';
/**
 * Circuit Breaker Events Emitter
 *
 * @remarks
 * Wrapper over ICircuitBreakerEventsPort for convenient usage.
 * All methods optional — if handler doesn't implement method, nothing happens.
 */
export declare class CircuitBreakerEventsEmitter {
    private readonly events?;
    constructor(events?: ICircuitBreakerEventsPort | undefined);
    /**
     * Emit state change event
     *
     * @param breakerName - Circuit breaker name
     * @param previous - Previous state
     * @param current - New state
     * @param timestamp - Event timestamp
     * @param reason - Change reason
     */
    emitStateChange(breakerName: string, previous: CircuitState, current: CircuitState, timestamp: number, reason: string): void;
    /**
     * Emit failure event
     *
     * @param breakerName - Circuit breaker name
     * @param state - Current state
     * @param error - Error
     * @param timestamp - Event timestamp
     * @param failureCount - Total failures
     * @param failuresInWindow - Failures in sliding window
     */
    emitFailure(breakerName: string, state: CircuitState, error: Error, timestamp: number, failureCount: number, failuresInWindow: number): void;
    /**
     * Emit success event
     *
     * @param breakerName - Circuit breaker name
     * @param state - Current state
     * @param timestamp - Event timestamp
     * @param successCount - Consecutive successes
     */
    emitSuccess(breakerName: string, state: CircuitState, timestamp: number, successCount: number): void;
    /**
     * Emit reset event
     *
     * @param breakerName - Circuit breaker name
     * @param previousState - State before reset
     * @param timestamp - Event timestamp
     */
    emitReset(breakerName: string, previousState: CircuitState, timestamp: number): void;
    /**
     * Check if events handler is present
     *
     * @returns true if events handler installed
     */
    hasEvents(): boolean;
}
