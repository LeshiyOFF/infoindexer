/**
 * Null Circuit Breaker Adapter
 *
 * @remarks
 * Infrastructure Layer — Null Object Pattern implementation.
 * Used for testing and when Circuit Breaker is disabled.
 *
 * Follows SRP: Always allows execution.
 * Follows LSP: Substitutable with any ICircuitBreakerPort.
 */
import { CircuitState } from '../domain/types/circuit-breaker.types';
/**
 * Null Circuit Breaker Adapter
 *
 * @remarks
 * Null Object Pattern: Implementation that does nothing.
 * Always executes functions, never blocks.
 *
 * Useful for:
 * - Testing
 * - Development
 * - When Circuit Breaker is disabled
 */
export class NullCircuitBreakerAdapter {
    breakerName;
    constructor(breakerName = 'null-circuit-breaker') {
        this.breakerName = breakerName;
    }
    async execute(fn) {
        try {
            const value = await fn();
            return {
                success: true,
                state: CircuitState.CLOSED,
                value
            };
        }
        catch (error) {
            return {
                success: false,
                state: CircuitState.CLOSED,
                error: 'execution_failed'
            };
        }
    }
    async executeWithFallback(fn, fallback) {
        const result = await this.execute(fn);
        if (result.success) {
            return result.value;
        }
        return fallback(result.error);
    }
    getState() {
        return CircuitState.CLOSED;
    }
    getStats() {
        return {
            state: CircuitState.CLOSED,
            failureCount: 0,
            successCount: 0,
            failuresInWindow: 0,
            lastFailureTime: 0,
            lastStateChange: 0,
            nextAttemptTime: 0
        };
    }
    reset() {
        // Nothing to reset
    }
    canProceed() {
        return true;
    }
}
