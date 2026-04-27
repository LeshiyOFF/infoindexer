/**
 * Circuit Breaker Executor
 *
 * @remarks
 * Infrastructure Layer — Executor in Hexagonal Architecture.
 * Extracted for SRP: Responsible only for function execution.
 *
 * Follows SRP: Responsible only for execution logic.
 */

import type {
  CircuitResult,
  CircuitError
} from '../domain/types/circuit-breaker.types';
import { CircuitState } from '../domain/types/circuit-breaker.types';
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
export class CircuitBreakerExecutor {
  constructor(
    private readonly breakerName: string,
    private readonly state: CircuitStateStorage,
    private readonly eventsEmitter: CircuitBreakerEventsEmitter,
    private readonly metricsRecorder: CircuitBreakerMetricsRecorder,
    private readonly now: () => number
  ) {}

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
  async execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>> {
    const currentTime = this.now();

    // Check for timeout-based transition
    if (this.state.shouldAttemptTransition(currentTime)) {
      this.state.transitionTo(CircuitState.HALF_OPEN);
    }

    // Check: circuit is open?
    if (this.state.currentState === CircuitState.OPEN) {
      this.metricsRecorder.recordBlocked(this.breakerName);
      return {
        success: false,
        state: CircuitState.OPEN,
        error: 'circuit_open'
      };
    }

    // Execute function
    try {
      const value = await fn();
      return this.handleSuccess(value);
    } catch (error) {
      return this.handleFailure(currentTime, error as Error);
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

  /**
   * Handle successful execution
   *
   * @param value - Return value
   * @returns Success result
   *
   * @remarks
   * Records success, checks for state transition.
   */
  private handleSuccess<T>(value: T): CircuitResult<T> {
    const result = this.state.recordSuccess();
    this.metricsRecorder.recordSuccess(this.breakerName);

    if (result.transition && result.to) {
      this.state.transitionTo(result.to);
    }

    // Emit success event (if subscriber exists)
    if (this.eventsEmitter.hasEvents()) {
      this.eventsEmitter.emitSuccess(
        this.breakerName,
        this.state.currentState,
        this.now(),
        this.state.successCount
      );
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
  private handleFailure(currentTime: number, error: Error): CircuitResult<never> {
    const result = this.state.recordFailure(currentTime);
    this.metricsRecorder.recordFailure(this.breakerName, error);

    if (result.transition && result.to) {
      this.state.transitionTo(result.to);
    }

    // Emit failure event (if subscriber exists)
    if (this.eventsEmitter.hasEvents()) {
      this.eventsEmitter.emitFailure(
        this.breakerName,
        this.state.currentState,
        error,
        this.now(),
        this.state.failureCount,
        this.state.failures.length
      );
    }

    const isErrorStateOpen = this.state.currentState === CircuitState.OPEN;
    return {
      success: false,
      state: this.state.currentState,
      error: isErrorStateOpen ? 'circuit_open' : 'execution_failed'
    };
  }
}
