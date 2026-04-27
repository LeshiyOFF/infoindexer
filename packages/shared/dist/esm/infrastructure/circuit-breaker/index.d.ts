/**
 * Circuit Breaker Module Exports
 *
 * @remarks
 * Centralized exports for Circuit Breaker functionality.
 * Follows Clean Architecture: organized by layer.
 */
export * from './domain/types/circuit-breaker.types';
export * from './domain/value-objects/circuit-breaker-config.vo';
export * from './ports/i-circuit-breaker.port';
export * from './ports/i-circuit-breaker-events.port';
export { CircuitBreakerAdapter } from './adapters/circuit-breaker.adapter';
export { NullCircuitBreakerAdapter } from './adapters/null-circuit-breaker.adapter';
export type { CircuitStateStorage, StateTransitionResult } from './adapters/circuit-state-storage.adapter';
export { CircuitBreakerExecutor } from './handlers/circuit-breaker-executor';
export { CircuitBreakerEventsEmitter } from './handlers/circuit-breaker-events-emitter';
export { CircuitBreakerMetricsRecorder } from './handlers/circuit-breaker-metrics-recorder';
export { CircuitBreakerFactory, createCircuitBreaker, createCircuitBreakerForClickHouse, createCircuitBreakerForAPI, createNullCircuitBreaker } from './factories/circuit-breaker.factory';
