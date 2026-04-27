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

import type {
  CircuitResult,
  CircuitStats,
  CircuitError
} from '../domain/types/circuit-breaker.types';
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
export class NullCircuitBreakerAdapter implements ICircuitBreakerPort {
  constructor(
    public readonly breakerName: string = 'null-circuit-breaker'
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>> {
    try {
      const value = await fn();
      return {
        success: true,
        state: CircuitState.CLOSED,
        value
      };
    } catch (error) {
      return {
        success: false,
        state: CircuitState.CLOSED,
        error: 'execution_failed'
      };
    }
  }

  async executeWithFallback<T>(
    fn: () => Promise<T>,
    fallback: (error: CircuitError) => Promise<T>
  ): Promise<T> {
    const result = await this.execute(fn);

    if (result.success) {
      return result.value;
    }

    return fallback(result.error);
  }

  getState(): CircuitState {
    return CircuitState.CLOSED;
  }

  getStats(): CircuitStats {
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

  reset(): void {
    // Nothing to reset
  }

  canProceed(): boolean {
    return true;
  }
}
