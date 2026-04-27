"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerAdapter = void 0;
const i_circuit_breaker_port_1 = require("../../ports/i-circuit-breaker.port");
const circuit_state_storage_1 = require("./circuit-state-storage");
const circuit_breaker_events_emitter_1 = require("../handlers/circuit-breaker-events-emitter");
const circuit_breaker_metrics_recorder_1 = require("../handlers/circuit-breaker-metrics-recorder");
const circuit_breaker_executor_1 = require("../handlers/circuit-breaker-executor");
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
class CircuitBreakerAdapter {
    breakerName;
    config;
    now;
    state;
    eventsEmitter;
    metricsRecorder;
    executor;
    constructor(breakerName, config, metrics, events, now = Date.now) {
        this.breakerName = breakerName;
        this.config = config;
        this.now = now;
        this.state = new circuit_state_storage_1.CircuitStateStorage(config, now);
        this.eventsEmitter = new circuit_breaker_events_emitter_1.CircuitBreakerEventsEmitter(events);
        this.metricsRecorder = new circuit_breaker_metrics_recorder_1.CircuitBreakerMetricsRecorder(metrics);
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
        this.transitionTo(i_circuit_breaker_port_1.CircuitState.CLOSED, 'manual_reset');
        this.eventsEmitter.emitReset(this.breakerName, previousState, this.now());
        this.metricsRecorder.recordReset(this.breakerName);
    }
    canProceed() {
        const currentTime = this.now();
        if (this.state.shouldAttemptTransition(currentTime)) {
            return true;
        }
        return this.state.currentState !== i_circuit_breaker_port_1.CircuitState.OPEN;
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
