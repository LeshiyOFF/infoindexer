/**
 * Хранилище состояния Circuit Breaker
 *
 * @remarks
 * Infrastructure Layer — State Storage в Hexagonal Architecture.
 * Выделено в отдельный класс для SRP.
 * Хранит изменяемое состояние, изолированное от адаптера.
 *
 * Следует SRP: ответственен только за хранение и изменение состояния.
 * Следует State Machine Pattern: CLOSED → OPEN → HALF_OPEN → CLOSED.
 */
import type { CircuitBreakerConfig } from '../../ports/i-circuit-breaker.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';
import type { StateChangeReason } from '../../ports/i-circuit-breaker-events.port';
/**
 * Результат изменения состояния
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Возвращается при изменении состояния circuit breaker.
 */
export interface StateTransitionResult {
    /** Произошло ли изменение состояния */
    readonly transition: boolean;
    /** Новое состояние (если было изменение) */
    readonly to?: CircuitState;
    /** Причина изменения */
    readonly reason?: StateChangeReason;
}
/**
 * Внутреннее хранилище состояния Circuit Breaker
 *
 * @remarks
 * Thread-safety: не гарантируется для конкурентного доступа.
 * Использует sliding window для отслеживания неудач.
 */
export declare class CircuitStateStorage {
    private readonly config;
    private readonly now;
    /** Текущее состояние */
    currentState: CircuitState;
    /** Количество неудач в текущем окне */
    failureCount: number;
    /** Количество успешных запросов подряд */
    successCount: number;
    /** Время последней неудачи (timestamp) */
    lastFailureTime: number;
    /** Время последнего изменения состояния (timestamp) */
    readonly lastStateChange: number;
    /** Время следующей попытки (timestamp) */
    nextAttemptTime: number;
    /** Количество вызов в HALF_OPEN состоянии */
    halfOpenCalls: number;
    /** Скользящее окно неудач (timestamps) */
    readonly failures: number[];
    constructor(config: CircuitBreakerConfig, now: () => number);
    /**
     * Проверяет, можно ли попытаться изменить состояние
     *
     * @param currentTime - Текущее время
     * @returns true если можно попытаться
     *
     * @remarks
     * В OPEN состоянии проверяет timeout.
     */
    shouldAttemptTransition(currentTime: number): boolean;
    /**
     * Записывает успешное выполнение
     *
     * @returns Результат изменения состояния
     *
     * @remarks
     * В HALF_OPEN: после successThreshold успешных запросов → CLOSED
     * В CLOSED: просто увеличивает счётчик успехов
     */
    recordSuccess(): StateTransitionResult;
    /**
     * Записывает неудачное выполнение
     *
     * @param currentTime - Текущее время
     * @returns Результат изменения состояния
     *
     * @remarks
     * В CLOSED: после failureThreshold неудач → OPEN
     * В HALF_OPEN: любая неудача → OPEN
     */
    recordFailure(currentTime: number): StateTransitionResult;
    /**
     * Переходит в новое состояние
     *
     * @param newState - Новое состояние
     *
     * @remarks
     * Обновляет lastStateChange при изменении.
     */
    transitionTo(newState: CircuitState): void;
    /**
     * Сбрасывает состояние в начальное
     *
     * @remarks
     * Используется для ручного восстановления.
     */
    reset(): void;
    /**
     * Удаляет устаревшие записи о неудачах
     *
     * @param currentTime - Текущее время
     *
     * @remarks
     * Удаляет записи старше slidingWindowSize.
     */
    private cleanOldFailures;
    /**
     * Проверяет, нужно ли открыть цепь
     *
     * @returns true если нужно открыть
     *
     * @remarks
     * Проверяет порог неудач.
     */
    private shouldOpenCircuit;
    /**
     * Возвращает статистику для мониторинга
     *
     * @returns Статистика circuit breaker
     */
    getStats(): import('../../ports/i-circuit-breaker.port').CircuitStats;
}
