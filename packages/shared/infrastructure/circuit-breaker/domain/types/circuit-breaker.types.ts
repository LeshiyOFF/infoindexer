/**
 * Circuit Breaker Types
 *
 * @remarks
 * Domain Layer — Types in Hexagonal Architecture.
 * Contains core types for Circuit Breaker pattern.
 *
 * @see https://martinfowler.com/bliki/CircuitBreaker.html
 */

/**
 * Circuit Breaker State
 *
 * @remarks
 * Three-state machine for fault tolerance:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failing state, requests are blocked
 * - HALF_OPEN: Testing if service has recovered
 */
export enum CircuitState {
  /** Normal operation, all requests pass through */
  CLOSED = 'closed',

  /** Failing state, requests are blocked immediately */
  OPEN = 'open',

  /** Testing mode, checks if service recovered */
  HALF_OPEN = 'half_open'
}

/**
 * Circuit Breaker Error Type
 *
 * @remarks
 * Distinguishes between two failure types:
 * - circuit_open: Circuit is OPEN, request was not executed
 * - execution_failed: Request executed but failed
 */
export type CircuitError = 'circuit_open' | 'execution_failed';

/**
 * Circuit Breaker Execution Result
 *
 * @remarks
 * Discriminated union for type-safe result handling.
 * Uses `success` property as discriminator.
 */
export type CircuitResult<T> =
  | { success: true; state: CircuitState; value: T }
  | { success: false; state: CircuitState; error: CircuitError };

/**
 * Circuit Breaker Statistics
 *
 * @remarks
 * Value Object with readonly properties for monitoring.
 */
export interface CircuitStats {
  /** Current state */
  readonly state: CircuitState;

  /** Failure count in current window */
  readonly failureCount: number;

  /** Consecutive success count */
  readonly successCount: number;

  /** Failures in sliding window */
  readonly failuresInWindow: number;

  /** Last failure timestamp */
  readonly lastFailureTime: number;

  /** Last state change timestamp */
  readonly lastStateChange: number;

  /** Next attempt timestamp */
  readonly nextAttemptTime: number;
}

/**
 * Circuit Breaker Configuration
 *
 * @remarks
 * Value Object interface with readonly properties.
 * Implementation: CircuitBreakerConfigVO.
 */
export interface CircuitBreakerConfig {
  /** Failure threshold to open circuit */
  readonly failureThreshold: number;

  /** Timeout in OPEN state before HALF_OPEN (ms) */
  readonly openTimeout: number;

  /** Timeout in HALF_OPEN before returning to OPEN (ms) */
  readonly halfOpenTimeout: number;

  /** Sliding window size for failure counting (ms) */
  readonly slidingWindowSize: number;

  /** Max calls in HALF_OPEN state */
  readonly halfOpenMaxCalls: number;

  /** Success threshold to close circuit */
  readonly successThreshold: number;
}

// Re-export for backward compatibility
export type {
  CircuitBreakerConfig as ICircuitBreakerConfig
} from './circuit-breaker.types';
