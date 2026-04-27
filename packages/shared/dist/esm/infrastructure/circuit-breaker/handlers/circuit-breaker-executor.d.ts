/**
 * Circuit Breaker Executor
 *
 * @remarks
 * Infrastructure Layer — Executor in Hexagonal Architecture.
 * Extracted for SRP: Responsible only for function execution.
 *
 * Follows SRP: Responsible only for execution logic.
 */
import type { CircuitResult, CircuitError } from '../domain/types/circuit-breaker.types';
import type { CircuitStateStorage } from '../adapters/circuit-state-storage.adapter';
import { CircuitBreakerEventsEmitter } from './circuit-breaker-events-emitter';
import { CircuitBreakerMetricsRecorder } from './circuit-breaker-metrics-recorder';
/**
 * Circuit Breaker Executor
 *
 * @remarks
 * Contains execution logic with state checking.
 * Used by CircuitBreakerAdapter for delegation.
 */
export declare class CircuitBreakerExecutor {
    private readonly breakerName;
    private readonly state;
    private readonly eventsEmitter;
    private readonly metricsRecorder;
    private readonly now;
    constructor(breakerName: string, state: CircuitStateStorage, eventsEmitter: CircuitBreakerEventsEmitter, metricsRecorder: CircuitBreakerMetricsRecorder, now: () => number);
    /**
     * Execute function with Circuit Breaker protection
     *
     * @param fn - Function to execute
     * @returns Execution result
     *
     * @remarks
     * - Checks state before execution
     * - Executes function if circuit closed
     * - Records result/error
     */
    execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>>;
    /**
     * Execute function with fallback on error
     *
     * @param fn - Primary function
     * @param fallback - Fallback function
     * @returns Result or fallback
     *
     * @remarks
     * If primary function fails, calls fallback with error code.
     */
    executeWithFallback<T>(fn: () => Promise<T>, fallback: (error: CircuitError) => Promise<T>): Promise<T>;
    /**
     * Handle successful execution
     *
     * @param value - Return value
     * @returns Success result
     *
     * @remarks
     * Records success, checks for state transition.
     */
    private handleSuccess;
    /**
     * Handle failed execution
     *
     * @param currentTime - Current timestamp
     * @param error - Error
     * @returns Failure result
     *
     * @remarks
     * Records failure, checks for state transition.
     */
    private handleFailure;
}
