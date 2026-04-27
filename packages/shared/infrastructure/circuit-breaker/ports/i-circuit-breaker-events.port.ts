/**
 * Circuit Breaker Events Port
 *
 * @remarks
 * Port for Circuit Breaker events (Observer Pattern).
 * Allows subscribing to Circuit Breaker state changes.
 *
 * Follows ISP: Minimal interface, focused on events only.
 * Follows DIP: Domain depends on this port, Infrastructure implements it.
 */

import type { CircuitState } from '../domain/types/circuit-breaker.types';

/**
 * State change event
 */
export interface StateChangeEvent {
  readonly breakerName: string;
  readonly previousState: CircuitState;
  readonly newState: CircuitState;
  readonly timestamp: number;
  readonly reason: StateChangeReason;
}

/**
 * Reason for state change
 */
export type StateChangeReason =
  | 'threshold_exceeded'
  | 'timeout_elapsed'
  | 'success_threshold'
  | 'manual_reset';

/**
 * Failure event
 */
export interface FailureEvent {
  readonly breakerName: string;
  readonly state: CircuitState;
  readonly error: Error;
  readonly timestamp: number;
  readonly failureCount: number;
  readonly failuresInWindow: number;
}

/**
 * Success event
 */
export interface SuccessEvent {
  readonly breakerName: string;
  readonly state: CircuitState;
  readonly timestamp: number;
  readonly successCount: number;
}

/**
 * Reset event
 */
export interface ResetEvent {
  readonly breakerName: string;
  readonly previousState: CircuitState;
  readonly timestamp: number;
}

/**
 * Union of all Circuit Breaker events
 */
export type CircuitBreakerEvent =
  | StateChangeEvent
  | FailureEvent
  | SuccessEvent
  | ResetEvent;

/**
 * Port for Circuit Breaker events
 *
 * @remarks
 * Observer Pattern: handlers subscribe to events.
 * All methods optional — implementation chooses what to handle.
 *
 * Follows ISP: Clients only depend on methods they use.
 */
export interface ICircuitBreakerEventsPort {
  /**
   * Handle state change
   *
   * @param event - Event data
   */
  onStateChange?(event: StateChangeEvent): void;

  /**
   * Handle failure
   *
   * @param event - Event data
   */
  onFailure?(event: FailureEvent): void;

  /**
   * Handle success
   *
   * @param event - Event data
   */
  onSuccess?(event: SuccessEvent): void;

  /**
   * Handle reset
   *
   * @param event - Event data
   */
  onReset?(event: ResetEvent): void;
}
