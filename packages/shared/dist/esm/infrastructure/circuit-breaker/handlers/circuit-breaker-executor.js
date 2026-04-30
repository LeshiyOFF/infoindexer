"use strict";
/**
 * Circuit Breaker Executor
 *
 * @remarks
 * Infrastructure Layer — Executor in Hexagonal Architecture.
 * Extracted for SRP: Responsible only for function execution.
 *
 * Follows SRP: Responsible only for execution logic.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerExecutor = void 0;
const circuit_breaker_types_1 = require("../domain/types/circuit-breaker.types");
/**
 * Circuit Breaker Executor
 *
 * @remarks
 * Contains execution logic with state checking.
 * Used by CircuitBreakerAdapter for delegation.
 */
class CircuitBreakerExecutor {
    breakerName;
    state;
    eventsEmitter;
    metricsRecorder;
    now;
    constructor(breakerName, state, eventsEmitter, metricsRecorder, now) {
        this.breakerName = breakerName;
        this.state = state;
        this.eventsEmitter = eventsEmitter;
        this.metricsRecorder = metricsRecorder;
        this.now = now;
    }
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
    async execute(fn) {
        const currentTime = this.now();
        // Check for timeout-based transition
        if (this.state.shouldAttemptTransition(currentTime)) {
            this.state.transitionTo(circuit_breaker_types_1.CircuitState.HALF_OPEN);
        }
        // Check: circuit is open?
        if (this.state.currentState === circuit_breaker_types_1.CircuitState.OPEN) {
            this.metricsRecorder.recordBlocked(this.breakerName);
            return {
                success: false,
                state: circuit_breaker_types_1.CircuitState.OPEN,
                error: 'circuit_open'
            };
        }
        // Execute function
        try {
            const value = await fn();
            return this.handleSuccess(value);
        }
        catch (error) {
            return this.handleFailure(currentTime, error);
        }
    }
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
    async executeWithFallback(fn, fallback) {
        const result = await this.execute(fn);
        if (result.success) {
            return result.value;
        }
        return fallback(result.error);
    }
    /**
     * Handle successful execution
     *
     * @param value - Return value
     * @returns Success result
     *
     * @remarks
     * Records success, checks for state transition.
     */
    handleSuccess(value) {
        const result = this.state.recordSuccess();
        this.metricsRecorder.recordSuccess(this.breakerName);
        if (result.transition && result.to) {
            this.state.transitionTo(result.to);
        }
        // Emit success event (if subscriber exists)
        if (this.eventsEmitter.hasEvents()) {
            this.eventsEmitter.emitSuccess(this.breakerName, this.state.currentState, this.now(), this.state.successCount);
        }
        return {
            success: true,
            state: this.state.currentState,
            value
        };
    }
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
    handleFailure(currentTime, error) {
        const result = this.state.recordFailure(currentTime);
        this.metricsRecorder.recordFailure(this.breakerName, error);
        if (result.transition && result.to) {
            this.state.transitionTo(result.to);
        }
        // Emit failure event (if subscriber exists)
        if (this.eventsEmitter.hasEvents()) {
            this.eventsEmitter.emitFailure(this.breakerName, this.state.currentState, error, this.now(), this.state.failureCount, this.state.failures.length);
        }
        const isErrorStateOpen = this.state.currentState === circuit_breaker_types_1.CircuitState.OPEN;
        return {
            success: false,
            state: this.state.currentState,
            error: isErrorStateOpen ? 'circuit_open' : 'execution_failed'
        };
    }
}
exports.CircuitBreakerExecutor = CircuitBreakerExecutor;
