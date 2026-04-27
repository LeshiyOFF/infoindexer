/**
 * Типы для Circuit Breaker Port
 *
 * @remarks
 * Domain Layer — Types в Hexagonal Architecture.
 * Содержит типы для Circuit Breaker.
 */
/**
 * Состояние Circuit Breaker
 *
 * @remarks
 * Enum определяет три состояния state machine:
 * - CLOSED: нормальная работа, запросы проходят
 * - OPEN: цепь разомкнута, запросы блокируются
 * - HALF_OPEN: пробный режим, проверка восстановления
 */
export declare enum CircuitState {
    /** Нормальная работа, все запросы выполняются */
    CLOSED = "closed",
    /** Цепь разомкнута, запросы блокируются немедленно */
    OPEN = "open",
    /** Пробный режим, один запрос проверяет доступность */
    HALF_OPEN = "half_open"
}
/**
 * Тип ошибки Circuit Breaker
 *
 * @remarks
 * Различает два типа отказов:
 * - circuit_open: цепь разомкнута, запрос не выполнялся
 * - execution_failed: запрос выполнился, но завершился ошибкой
 */
export type CircuitError = 'circuit_open' | 'execution_failed';
/**
 * Результат выполнения через Circuit Breaker
 *
 * @remarks
 * Discriminated union для типобезопасной обработки результатов.
 * Использует success property как discriminator.
 */
export type CircuitResult<T> = {
    success: true;
    state: CircuitState;
    value: T;
} | {
    success: false;
    state: CircuitState;
    error: CircuitError;
};
/**
 * Статистика Circuit Breaker для мониторинга
 *
 * @remarks
 * Value Object с readonly свойствами.
 */
export interface CircuitStats {
    /** Текущее состояние */
    readonly state: CircuitState;
    /** Количество неудач в текущем окне */
    readonly failureCount: number;
    /** Количество успешных запросов подряд */
    readonly successCount: number;
    /** Количество неудач в скользящем окне */
    readonly failuresInWindow: number;
    /** Время последней неудачи (timestamp) */
    readonly lastFailureTime: number;
    /** Время последнего изменения состояния (timestamp) */
    readonly lastStateChange: number;
    /** Время следующей попытки (timestamp) */
    readonly nextAttemptTime: number;
}
/**
 * Конфигурация Circuit Breaker
 *
 * @remarks
 * Value Object с readonly свойствами.
 */
export interface CircuitBreakerConfig {
    /** Порог неудач для открытия цепи */
    readonly failureThreshold: number;
    /** Таймаут в OPEN состоянии перед переходом в HALF_OPEN (ms) */
    readonly openTimeout: number;
    /** Таймаут в HALF_OPEN перед возвратом в OPEN (ms) */
    readonly halfOpenTimeout: number;
    /** Размер скользящего окна для подсчёта неудач (ms) */
    readonly slidingWindowSize: number;
    /** Максимальное количество вызовов в HALF_OPEN */
    readonly halfOpenMaxCalls: number;
    /** Порог успешных вызовов для закрытия цепи */
    readonly successThreshold: number;
}
