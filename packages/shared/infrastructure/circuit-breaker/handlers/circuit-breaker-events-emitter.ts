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

import type {
  ICircuitBreakerEventsPort,
  StateChangeEvent,
  FailureEvent,
  SuccessEvent,
  ResetEvent
} from '../ports/i-circuit-breaker-events.port';
import { CircuitState } from '../domain/types/circuit-breaker.types';

/**
 * Circuit Breaker Events Emitter
 *
 * @remarks
 * Wrapper over ICircuitBreakerEventsPort for convenient usage.
 * All methods optional — if handler doesn't implement method, nothing happens.
 */
export class CircuitBreakerEventsEmitter {
  constructor(
    private readonly events?: ICircuitBreakerEventsPort
  ) {}

  /**
   * Emit state change event
   *
   * @param breakerName - Circuit breaker name
   * @param previous - Previous state
   * @param current - New state
   * @param timestamp - Event timestamp
   * @param reason - Change reason
   */
  emitStateChange(
    breakerName: string,
    previous: CircuitState,
    current: CircuitState,
    timestamp: number,
    reason: string
  ): void {
    if (!this.events?.onStateChange) {
      return;
    }

    const event: StateChangeEvent = {
      breakerName,
      previousState: previous,
      newState: current,
      timestamp,
      reason: reason as Parameters<NonNullable<ICircuitBreakerEventsPort['onStateChange']>>[0]['reason']
    };
    this.events.onStateChange(event);
  }

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
  emitFailure(
    breakerName: string,
    state: CircuitState,
    error: Error,
    timestamp: number,
    failureCount: number,
    failuresInWindow: number
  ): void {
    if (!this.events?.onFailure) {
      return;
    }

    const event: FailureEvent = {
      breakerName,
      state,
      error,
      timestamp,
      failureCount,
      failuresInWindow
    };
    this.events.onFailure(event);
  }

  /**
   * Emit success event
   *
   * @param breakerName - Circuit breaker name
   * @param state - Current state
   * @param timestamp - Event timestamp
   * @param successCount - Consecutive successes
   */
  emitSuccess(
    breakerName: string,
    state: CircuitState,
    timestamp: number,
    successCount: number
  ): void {
    if (!this.events?.onSuccess) {
      return;
    }

    const event: SuccessEvent = {
      breakerName,
      state,
      timestamp,
      successCount
    };
    this.events.onSuccess(event);
  }

  /**
   * Emit reset event
   *
   * @param breakerName - Circuit breaker name
   * @param previousState - State before reset
   * @param timestamp - Event timestamp
   */
  emitReset(
    breakerName: string,
    previousState: CircuitState,
    timestamp: number
  ): void {
    if (!this.events?.onReset) {
      return;
    }

    const event: ResetEvent = {
      breakerName,
      previousState,
      timestamp
    };
    this.events.onReset(event);
  }

  /**
   * Check if events handler is present
   *
   * @returns true if events handler installed
   */
  hasEvents(): boolean {
    return this.events !== undefined;
  }
}
