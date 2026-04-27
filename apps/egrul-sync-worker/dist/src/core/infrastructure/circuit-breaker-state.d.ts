/**
 * Circuit Breaker State Management
 *
 * Выделен в отдельный класс по SRP.
 */
import { CircuitState } from './circuit-breaker-types';
import type { CircuitBreakerConfig } from './circuit-breaker-config';
import type { CircuitStats } from './circuit-breaker-config';
/**
 * Хранилище состояния Circuit Breaker
 */
export declare class CircuitStateStorage {
    private readonly config;
    readonly now: () => number;
    currentState: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
    lastStateChange: number;
    nextAttemptTime: number;
    readonly failures: number[];
    constructor(config: CircuitBreakerConfig, now: () => number);
    /** Проверяет нужно ли переход из OPEN в HALF_OPEN */
    shouldAttemptTransition(currentTime: number): boolean;
    /** Обработка успешного выполнения */
    onSuccess(): void;
    /** Обработка неудачного выполнения */
    onFailure(currentTime: number): void;
    /** Очищает старые записи за пределами окна */
    private cleanOldFailures;
    /** Проверяет порог для открытия цепи */
    private shouldOpenCircuit;
    /** Переход в новое состояние */
    transitionTo(newState: CircuitState): void;
    /** Сброс состояния */
    reset(): void;
    /** Статистика */
    getStats(): CircuitStats;
}
