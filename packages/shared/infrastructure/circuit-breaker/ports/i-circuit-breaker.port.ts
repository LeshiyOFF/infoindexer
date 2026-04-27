/**
 * Circuit Breaker Port
 *
 * @remarks
 * Port interface for Circuit Breaker functionality.
 * Follows Dependency Inversion: Domain depends on this port.
 * Follows Interface Segregation: Minimal, focused interface.
 *
 * @see https://martinfowler.com/bliki/CircuitBreaker.html
 */

import type {
  CircuitResult,
  CircuitStats,
  CircuitError,
  CircuitState,
  CircuitBreakerConfig
} from '../domain/types/circuit-breaker.types';

// Re-export config type for convenience
export type { CircuitBreakerConfig };

/**
 * Circuit Breaker Port
 *
 * @remarks
 * Defines contract for fault tolerance through Circuit Breaker pattern.
 * Main method: execute() — runs function with protection.
 *
 * Thread-safety: Implementations must be thread-safe for async use.
 *
 * @example
 * ```ts
 * class DatabaseService {
 *   constructor(private readonly breaker: ICircuitBreakerPort) {}
 *
 *   async query<T>(sql: string): Promise<T> {
 *     return this.breaker.execute(async () => {
 *       return await this.db.query(sql);
 *     });
 *   }
 * }
 * ```
 */
export interface ICircuitBreakerPort {
  /**
   * Execute operation with Circuit Breaker protection
   *
   * @param fn - Function to execute
   * @returns Result or error
   *
   * @remarks
   * Behavior depends on current state:
   * - CLOSED: Executes fn, records result
   * - OPEN: Returns circuit_open without execution
   * - HALF_OPEN: Executes fn to test recovery
   *
   * Increments failure counter on error.
   * Resets counter on success.
   */
  execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>>;

  /**
   * Execute operation with fallback on error
   *
   * @param fn - Primary function
   * @param fallback - Fallback function
   * @returns Result or fallback
   *
   * @remarks
   * Fallback is called on:
   * - circuit_open: Circuit is OPEN
   * - execution_failed: Function returned error
   *
   * Enables graceful degradation.
   *
   * @example
   * ```ts
   * const result = await breaker.executeWithFallback(
   *   () => fetchFromPrimary(),
   *   () => fetchFromCache()
   * );
   * ```
   */
  executeWithFallback<T>(
    fn: () => Promise<T>,
    fallback: (error: CircuitError) => Promise<T>
  ): Promise<T>;

  /**
   * Get current state
   *
   * @returns Current state
   */
  getState(): CircuitState;

  /**
   * Get statistics for monitoring
   *
   * @returns Circuit breaker statistics
   */
  getStats(): CircuitStats;

  /**
   * Reset to CLOSED state
   *
   * @remarks
   * Used for manual recovery after fixing dependency issues.
   */
  reset(): void;

  /**
   * Check if execution is allowed
   *
   * @returns true if execution allowed
   *
   * @remarks
   * Returns false in OPEN state.
   * Used for pre-flight checks.
   */
  canProceed(): boolean;
}
