/**
 * Adapter для Circuit Breaker — реализация Port
 *
 * @remarks
 * Infrastructure Layer — Adapter в Hexagonal Architecture.
 * Реализует ICircuitBreakerPort для защиты от каскадных сбоев.
 *
 * Следует SRP: ответственен только за circuit breaker логику.
 * Следует DIP: реализует Port из Domain.
 * Следует OCP: открыт для расширения через events.
 */

import type {
  CircuitResult,
  CircuitStats,
  CircuitError
} from '../../ports/i-circuit-breaker.port';
import type { ICircuitBreakerPort } from '../../ports/i-circuit-breaker.port';
import type { CircuitBreakerConfig } from '../../ports/i-circuit-breaker.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';
import type { ICircuitBreakerEventsPort, StateChangeReason } from '../../ports/i-circuit-breaker-events.port';
import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';
import { CircuitStateStorage } from './circuit-state-storage';
import { CircuitBreakerEventsEmitter } from '../handlers/circuit-breaker-events-emitter';
import { CircuitBreakerMetricsRecorder } from '../handlers/circuit-breaker-metrics-recorder';
import { CircuitBreakerExecutor } from '../handlers/circuit-breaker-executor';

/**
 * Adapter для Circuit Breaker
 *
 * @remarks
 * Реализует ICircuitBreakerPort, делегируя:
 * - Хранение состояния → CircuitStateStorage
 * - Отправка событий → CircuitBreakerEventsEmitter
 * - Запись метрик → CircuitBreakerMetricsRecorder
 * - Выполнение функций → CircuitBreakerExecutor
 */
export class CircuitBreakerAdapter implements ICircuitBreakerPort {
  private readonly state: CircuitStateStorage;
  private readonly eventsEmitter: CircuitBreakerEventsEmitter;
  private readonly metricsRecorder: CircuitBreakerMetricsRecorder;
  private readonly executor: CircuitBreakerExecutor;

  constructor(
    public readonly breakerName: string,
    private readonly config: CircuitBreakerConfig,
    metrics?: IMetricsCollectorPort,
    events?: ICircuitBreakerEventsPort,
    private readonly now: () => number = Date.now
  ) {
    this.state = new CircuitStateStorage(config, now);
    this.eventsEmitter = new CircuitBreakerEventsEmitter(events);
    this.metricsRecorder = new CircuitBreakerMetricsRecorder(metrics);
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
