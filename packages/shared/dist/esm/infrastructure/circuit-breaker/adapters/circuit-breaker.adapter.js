"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerAdapter = void 0;
const circuit_breaker_types_1 = require("../domain/types/circuit-breaker.types");
const circuit_state_storage_adapter_1 = require("./circuit-state-storage.adapter");
const circuit_breaker_events_emitter_1 = require("../handlers/circuit-breaker-events-emitter");
const circuit_breaker_metrics_recorder_1 = require("../handlers/circuit-breaker-metrics-recorder");
const circuit_breaker_executor_1 = require("../handlers/circuit-breaker-executor");
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
class CircuitBreakerAdapter {
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
        this.state = new circuit_state_storage_adapter_1.CircuitStateStorage(config, now);
        this.eventsEmitter = new circuit_breaker_events_emitter_1.CircuitBreakerEventsEmitter(events);
        this.metricsRecorder = new circuit_breaker_metrics_recorder_1.CircuitBreakerMetricsRecorder(enableMetrics);
        this.executor = new circuit_breaker_executor_1.CircuitBreakerExecutor(breakerName, this.state, this.eventsEmitter, this.metricsRecorder, now);
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
        this.transitionTo(circuit_breaker_types_1.CircuitState.CLOSED, 'manual_reset');
        this.eventsEmitter.emitReset(this.breakerName, previousState, this.now());
        this.metricsRecorder.recordReset(this.breakerName);
    }
    canProceed() {
        const currentTime = this.now();
        if (this.state.shouldAttemptTransition(currentTime)) {
            return true;
        }
        return this.state.currentState !== circuit_breaker_types_1.CircuitState.OPEN;
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
exports.CircuitBreakerAdapter = CircuitBreakerAdapter;
