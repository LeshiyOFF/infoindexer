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
import type { CircuitResult, CircuitStats, CircuitError } from '../../ports/i-circuit-breaker.port';
import type { ICircuitBreakerPort } from '../../ports/i-circuit-breaker.port';
import type { CircuitBreakerConfig } from '../../ports/i-circuit-breaker.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';
import type { ICircuitBreakerEventsPort } from '../../ports/i-circuit-breaker-events.port';
import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';
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
export declare class CircuitBreakerAdapter implements ICircuitBreakerPort {
    readonly breakerName: string;
    private readonly config;
    private readonly now;
    private readonly state;
    private readonly eventsEmitter;
    private readonly metricsRecorder;
    private readonly executor;
    constructor(breakerName: string, config: CircuitBreakerConfig, metrics?: IMetricsCollectorPort, events?: ICircuitBreakerEventsPort, now?: () => number);
    execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>>;
    executeWithFallback<T>(fn: () => Promise<T>, fallback: (error: CircuitError) => Promise<T>): Promise<T>;
    getState(): CircuitState;
    getStats(): CircuitStats;
    reset(): void;
    canProceed(): boolean;
    private transitionTo;
}
