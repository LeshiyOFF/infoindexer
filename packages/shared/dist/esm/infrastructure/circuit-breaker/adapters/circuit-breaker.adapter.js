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
import { CircuitState } from '../domain/types/circuit-breaker.types';
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
export class CircuitBreakerAdapter {
    breakerName;
    config;
    now;
    state;
    eventsEmitter;
    metricsRecorder;
    executor;
    constructor(breakerName, config, enableMetrics, events, now = Date.now) {
        this.breakerName = breakerName;
        this.config = config;
        this.now = now;
        this.state = new CircuitStateStorage(config, now);
        this.eventsEmitter = new CircuitBreakerEventsEmitter(events);
        this.metricsRecorder = new CircuitBreakerMetricsRecorder(enableMetrics);
        this.executor = new CircuitBreakerExecutor(breakerName, this.state, this.eventsEmitter, this.metricsRecorder, now);
    }
    async execute(fn) {
        return this.executor.execute(fn);
    }
    async executeWithFallback(fn, fallback) {
        return this.executor.executeWithFallback(fn, fallback);
    }
    getState() {
        return this.state.currentState;
    }
    getStats() {
        return this.state.getStats();
    }
    reset() {
        const previousState = this.state.currentState;
        this.state.reset();
        this.transitionTo(CircuitState.CLOSED, 'manual_reset');
        this.eventsEmitter.emitReset(this.breakerName, previousState, this.now());
        this.metricsRecorder.recordReset(this.breakerName);
    }
    canProceed() {
        const currentTime = this.now();
        if (this.state.shouldAttemptTransition(currentTime)) {
            return true;
        }
        return this.state.currentState !== CircuitState.OPEN;
    }
    transitionTo(newState, reason) {
        if (this.state.currentState === newState) {
            return;
        }
        const previousState = this.state.currentState;
        this.state.transitionTo(newState);
        this.eventsEmitter.emitStateChange(this.breakerName, previousState, newState, this.now(), reason);
        this.metricsRecorder.recordStateChange(this.breakerName, newState);
    }
}
