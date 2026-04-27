/**
 * Circuit Breaker Manager — Facade для управления CB
 *
 * @remarks
 * Domain Layer — Service в Hexagonal Architecture.
 * Facade Pattern: единая точка входа для всех CB операций.
 * Делегирует работу CircuitBreakerRegistry и CircuitBreakerHealthChecker.
 *
 * Следует SRP: ответственен только за координацию.
 * Следует Facade Pattern: скрывает сложность работы с реестром.
 */
import type { CircuitResult } from '../ports/i-circuit-breaker.port';
import { CircuitState } from '../ports/i-circuit-breaker.port';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import type { CircuitBreakerHealth } from './types/circuit-breaker-health.types';
import type { ICircuitBreakerManagerPort } from '../ports/i-circuit-breaker-manager.port';
/**
 * Facade для управления Circuit Breaker
 *
 * @remarks
 * Реализует ICircuitBreakerManagerPort.
 * Делегирует работу CircuitBreakerRegistry и CircuitBreakerHealthChecker.
 */
export declare class CircuitBreakerManager implements ICircuitBreakerManagerPort {
    private readonly registry;
    private readonly healthChecker;
    constructor();
    registerFactory(breakerName: string, factory: () => ICircuitBreakerPort): void;
    register(name: string, breaker: ICircuitBreakerPort): void;
    has(breakerName: string): boolean;
    names(): string[];
    private getOrCreateBreaker;
    getHealth(): CircuitBreakerHealth;
    resetAll(): void;
    reset(breakerName: string): boolean;
    isAllClosed(): boolean;
    getOpenBreakers(): string[];
    execute<T>(breakerName: string, fn: () => Promise<T>): Promise<CircuitResult<T>>;
    executeWithFallback<T>(breakerName: string, fn: () => Promise<T>, fallback: (error: Error) => Promise<T>): Promise<T>;
    getState(breakerName: string): CircuitState;
}
