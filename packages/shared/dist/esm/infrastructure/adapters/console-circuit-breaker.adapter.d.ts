/**
 * Console Circuit Breaker Adapter
 *
 * @remarks
 * Console-логирующая реализация ICircuitBreaker port.
 * Следует SRP: только логирование в console.
 * Следует DIP: реализует ICircuitBreaker port.
 * Следует LSP: может быть заменён любой другой реализацией ICircuitBreaker.
 *
 * Подходит для разработки и отладки.
 * В production заменить на метрик-ориентированный адаптер (Prometheus, etc.).
 */
import type { ICircuitBreaker } from '../ports/i-circuit-breaker.port';
import { CircuitBreakerConfig } from '../domain/circuit-breaker-config.vo';
import { CircuitBreakerState } from '../domain/circuit-breaker-state.enum';
export declare class ConsoleCircuitBreaker implements ICircuitBreaker {
    private readonly config;
    private readonly breakers;
    constructor(config: CircuitBreakerConfig);
    execute<T>(breakerName: string, operation: () => Promise<T>): Promise<T>;
    getState(breakerName: string): CircuitBreakerState;
    reset(breakerName: string): void;
    canExecute(breakerName: string): boolean;
    private getOrCreateState;
    private canExecuteState;
    private recordSuccess;
    private recordFailure;
    private evaluateState;
    private transitionTo;
    private resetCounters;
    private emit;
}
