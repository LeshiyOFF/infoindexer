/**
 * Circuit Breaker Types
 */
/**
 * Состояния Circuit Breaker
 */
export declare enum CircuitState {
    /** Нормальная работа */
    CLOSED = "closed",
    /** Запросы блокируются */
    OPEN = "open",
    /** Пробный режим */
    HALF_OPEN = "half_open"
}
/**
 * Результат выполнения через Circuit Breaker
 */
export type CircuitResult<T> = {
    success: true;
    state: CircuitState;
    value: T;
} | {
    success: false;
    state: CircuitState;
    error: 'circuit_open' | 'execution_failed';
};
