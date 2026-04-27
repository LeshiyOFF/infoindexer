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
export class CircuitStateStorage {
  /** Current state */
  currentState: CircuitState;

  /** Failures in current window */
  failureCount = 0;

  /** Consecutive successes */
  successCount = 0;

  /** Last failure timestamp */
  lastFailureTime = 0;

  /** Last state change timestamp */
  readonly lastStateChange: number;

  /** Next attempt timestamp */
  nextAttemptTime = 0;

  /** Calls in HALF_OPEN state */
  halfOpenCalls = 0;

  /** Sliding window of failures (timestamps) */
  readonly failures: number[] = [];

  constructor(
    private readonly config: CircuitBreakerConfig,
    private readonly now: () => number
  ) {
    this.currentState = CircuitState.CLOSED;
    this.lastStateChange = now();
  }

  /**
   * Check if transition should be attempted
   *
   * @param currentTime - Current timestamp
   * @returns true if should attempt
   *
   * @remarks
   * In OPEN state, checks timeout.
   */
  shouldAttemptTransition(currentTime: number): boolean {
    return this.currentState === CircuitState.OPEN && currentTime >= this.nextAttemptTime;
  }

  /**
   * Record successful execution
   *
   * @returns State transition result
   *
   * @remarks
   * HALF_OPEN: After successThreshold successes → CLOSED
   * CLOSED: Just increments success counter
   */
  recordSuccess(): StateTransitionResult {
    this.failureCount = 0;
    this.failures.length = 0;

    if (this.currentState === CircuitState.HALF_OPEN) {
      this.halfOpenCalls++;
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls ||
          this.successCount + 1 >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        this.successCount = 0;
        return { transition: true, to: CircuitState.CLOSED, reason: 'success_threshold' as StateChangeReason };
      }
    } else if (this.currentState === CircuitState.CLOSED) {
      this.successCount++;
    }
    return { transition: false };
  }

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
  recordFailure(currentTime: number): StateTransitionResult {
    this.failureCount++;
    this.lastFailureTime = currentTime;
    this.failures.push(currentTime);

    this.cleanOldFailures(currentTime);

    if (this.currentState === CircuitState.CLOSED && this.shouldOpenCircuit()) {
      this.transitionTo(CircuitState.OPEN);
      this.nextAttemptTime = currentTime + this.config.openTimeout;
      return { transition: true, to: CircuitState.OPEN, reason: 'threshold_exceeded' as StateChangeReason };
    } else if (this.currentState === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
      this.nextAttemptTime = currentTime + this.config.openTimeout;
      return { transition: true, to: CircuitState.OPEN, reason: 'threshold_exceeded' as StateChangeReason };
    }
    return { transition: false };
  }

  /**
   * Transition to new state
   *
   * @param newState - New state
   *
   * @remarks
   * Updates lastStateChange on transition.
   */
  transitionTo(newState: CircuitState): void {
    if (this.currentState !== newState) {
      this.currentState = newState;
      (this.lastStateChange as number) = this.now();
    }
  }

  /**
   * Reset to initial state
   *
   * @remarks
   * Used for manual recovery.
   */
  reset(): void {
    this.currentState = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    this.failures.length = 0;
    (this.lastStateChange as number) = this.now();
  }

  /**
   * Remove stale failure records
   *
   * @param currentTime - Current timestamp
   *
   * @remarks
   * Removes records older than slidingWindowSize.
   */
  private cleanOldFailures(currentTime: number): void {
    const windowStart = currentTime - this.config.slidingWindowSize;
    while (this.failures.length > 0 && this.failures[0]! < windowStart) {
      this.failures.shift();
    }
  }

  /**
   * Check if circuit should open
   *
   * @returns true if should open
   *
   * @remarks
   * Checks failure threshold.
   */
  private shouldOpenCircuit(): boolean {
    return this.failureCount >= this.config.failureThreshold;
  }

  /**
   * Get statistics for monitoring
   *
   * @returns Circuit breaker statistics
   */
  getStats(): import('../domain/types/circuit-breaker.types').CircuitStats {
    return {
      state: this.currentState,
      failureCount: this.failureCount,
      successCount: this.successCount,
      failuresInWindow: this.failures.length,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
      nextAttemptTime: this.nextAttemptTime
    };
  }
}
