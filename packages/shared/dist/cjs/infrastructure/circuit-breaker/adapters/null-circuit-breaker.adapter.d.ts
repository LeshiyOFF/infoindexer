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
import type { CircuitResult, CircuitStats, CircuitError } from '../domain/types/circuit-breaker.types';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
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
export declare class NullCircuitBreakerAdapter implements ICircuitBreakerPort {
    readonly breakerName: string;
    constructor(breakerName?: string);
    execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>>;
    executeWithFallback<T>(fn: () => Promise<T>, fallback: (error: CircuitError) => Promise<T>): Promise<T>;
    getState(): CircuitState;
    getStats(): CircuitStats;
    reset(): void;
    canProceed(): boolean;
}
