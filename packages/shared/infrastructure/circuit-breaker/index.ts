/**
 * Circuit Breaker Module Exports
 *
 * @remarks
 * Centralized exports for Circuit Breaker functionality.
 * Follows Clean Architecture: organized by layer.
 */

// Domain Types
export * from './domain/types/circuit-breaker.types';

// Domain Value Objects
export * from './domain/value-objects/circuit-breaker-config.vo';

// Ports (Interfaces)
export * from './ports/i-circuit-breaker.port';
export * from './ports/i-circuit-breaker-events.port';

// Adapters
export { CircuitBreakerAdapter } from './adapters/circuit-breaker.adapter';
export { NullCircuitBreakerAdapter } from './adapters/null-circuit-breaker.adapter';
export type { CircuitStateStorage, StateTransitionResult } from './adapters/circuit-state-storage.adapter';

// Handlers (internal, but exported for testing)
export { CircuitBreakerExecutor } from './handlers/circuit-breaker-executor';
export { CircuitBreakerEventsEmitter } from './handlers/circuit-breaker-events-emitter';
export { CircuitBreakerMetricsRecorder } from './handlers/circuit-breaker-metrics-recorder';

// Factories
export {
  CircuitBreakerFactory,
  createCircuitBreaker,
  createCircuitBreakerForClickHouse,
  createCircuitBreakerForAPI,
  createNullCircuitBreaker
} from './factories/circuit-breaker.factory';
