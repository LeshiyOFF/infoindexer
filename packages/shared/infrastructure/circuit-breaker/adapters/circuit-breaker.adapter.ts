/**
 * Circuit Breaker Adapter
 *
 * @remarks
 * Infrastructure Layer — Adapter in Hexagonal Architecture.
 * Implements ICircuitBreakerPort for fault tolerance.
 *
 * Follows SRP: Responsible only for circuit breaker coordination.
 * Follows DIP: Implements Port from Domain.
 * Follows OCP: Open for extension via events.
 *
 * Uses composition:
 * - State storage → CircuitStateStorage
 * - Event emission → CircuitBreakerEventsEmitter
 * - Metrics recording → CircuitBreakerMetricsRecorder
 * - Execution → CircuitBreakerExecutor
 */

import type {
  CircuitResult,
  CircuitStats,
  CircuitError,
  CircuitBreakerConfig
} from '../domain/types/circuit-breaker.types';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import { CircuitState } from '../domain/types/circuit-breaker.types';
import type { ICircuitBreakerEventsPort } from '../ports/i-circuit-breaker-events.port';
import type { StateChangeReason } from '../ports/i-circuit-breaker-events.port';
import { CircuitStateStorage } from './circuit-state-storage.adapter';
import { CircuitBreakerEventsEmitter } from '../handlers/circuit-breaker-events-emitter';
import { CircuitBreakerMetricsRecorder } from '../handlers/circuit-breaker-metrics-recorder';
import { CircuitBreakerExecutor } from '../handlers/circuit-breaker-executor';

/**
 * Circuit Breaker Adapter
 *
 * @remarks
 * Implements ICircuitBreakerPort, delegating to specialized components:
 * - State management → CircuitStateStorage
 * - Event emission → CircuitBreakerEventsEmitter
 * - Metrics recording → CircuitBreakerMetricsRecorder
 * - Execution → CircuitBreakerExecutor
 */
export class CircuitBreakerAdapter implements ICircuitBreakerPort {
  private readonly state: CircuitStateStorage;
  private readonly eventsEmitter: CircuitBreakerEventsEmitter;
  private readonly metricsRecorder: CircuitBreakerMetricsRecorder;
  private readonly executor: CircuitBreakerExecutor;

  constructor(
    public readonly breakerName: string,
    private readonly config: CircuitBreakerConfig,
    enableMetrics?: boolean,
    events?: ICircuitBreakerEventsPort,
    private readonly now: () => number = Date.now
  ) {
    this.state = new CircuitStateStorage(config, now);
    this.eventsEmitter = new CircuitBreakerEventsEmitter(events);
    this.metricsRecorder = new CircuitBreakerMetricsRecorder(enableMetrics);
    this.executor = new CircuitBreakerExecutor(
      breakerName,
      this.state,
      this.eventsEmitter,
      this.metricsRecorder,
      now
    );
  }

  async execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>> {
    return this.executor.execute(fn);
  }

  async executeWithFallback<T>(
    fn: () => Promise<T>,
    fallback: (error: CircuitError) => Promise<T>
  ): Promise<T> {
    return this.executor.executeWithFallback(fn, fallback);
  }

  getState(): CircuitState {
    return this.state.currentState;
  }

  getStats(): CircuitStats {
    return this.state.getStats();
  }

  reset(): void {
    const previousState = this.state.currentState;
    this.state.reset();
    this.transitionTo(CircuitState.CLOSED, 'manual_reset');
    this.eventsEmitter.emitReset(this.breakerName, previousState, this.now());
    this.metricsRecorder.recordReset(this.breakerName);
  }

  canProceed(): boolean {
    const currentTime = this.now();
    if (this.state.shouldAttemptTransition(currentTime)) {
      return true;
    }
    return this.state.currentState !== CircuitState.OPEN;
  }

  private transitionTo(newState: CircuitState, reason: StateChangeReason): void {
    if (this.state.currentState === newState) {
      return;
    }

    const previousState = this.state.currentState;
    this.state.transitionTo(newState);

    this.eventsEmitter.emitStateChange(
      this.breakerName,
      previousState,
      newState,
      this.now(),
      reason
    );
    this.metricsRecorder.recordStateChange(this.breakerName, newState);
  }
}
