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
import type { CircuitResult, CircuitStats, CircuitError, CircuitBreakerConfig } from '../domain/types/circuit-breaker.types';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import { CircuitState } from '../domain/types/circuit-breaker.types';
import type { ICircuitBreakerEventsPort } from '../ports/i-circuit-breaker-events.port';
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
export declare class CircuitBreakerAdapter implements ICircuitBreakerPort {
    readonly breakerName: string;
    private readonly config;
    private readonly now;
    private readonly state;
    private readonly eventsEmitter;
    private readonly metricsRecorder;
    private readonly executor;
    constructor(breakerName: string, config: CircuitBreakerConfig, enableMetrics?: boolean, events?: ICircuitBreakerEventsPort, now?: () => number);
    execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>>;
    executeWithFallback<T>(fn: () => Promise<T>, fallback: (error: CircuitError) => Promise<T>): Promise<T>;
    getState(): CircuitState;
    getStats(): CircuitStats;
    reset(): void;
    canProceed(): boolean;
    private transitionTo;
}
