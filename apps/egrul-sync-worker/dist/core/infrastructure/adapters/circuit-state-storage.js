"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitStateStorage = void 0;
const i_circuit_breaker_port_1 = require("../../ports/i-circuit-breaker.port");
/**
 * Внутреннее хранилище состояния Circuit Breaker
 *
 * @remarks
 * Thread-safety: не гарантируется для конкурентного доступа.
 * Использует sliding window для отслеживания неудач.
 */
class CircuitStateStorage {
    config;
    now;
    /** Текущее состояние */
    currentState;
    /** Количество неудач в текущем окне */
    failureCount = 0;
    /** Количество успешных запросов подряд */
    successCount = 0;
    /** Время последней неудачи (timestamp) */
    lastFailureTime = 0;
    /** Время последнего изменения состояния (timestamp) */
    lastStateChange;
    /** Время следующей попытки (timestamp) */
    nextAttemptTime = 0;
    /** Количество вызов в HALF_OPEN состоянии */
    halfOpenCalls = 0;
    /** Скользящее окно неудач (timestamps) */
    failures = [];
    constructor(config, now) {
        this.config = config;
        this.now = now;
        this.currentState = i_circuit_breaker_port_1.CircuitState.CLOSED;
        this.lastStateChange = now();
    }
    /**
     * Проверяет, можно ли попытаться изменить состояние
     *
     * @param currentTime - Текущее время
     * @returns true если можно попытаться
     *
     * @remarks
     * В OPEN состоянии проверяет timeout.
     */
    shouldAttemptTransition(currentTime) {
        return this.currentState === i_circuit_breaker_port_1.CircuitState.OPEN && currentTime >= this.nextAttemptTime;
    }
    /**
     * Записывает успешное выполнение
     *
     * @returns Результат изменения состояния
     *
     * @remarks
     * В HALF_OPEN: после successThreshold успешных запросов → CLOSED
     * В CLOSED: просто увеличивает счётчик успехов
     */
    recordSuccess() {
        this.failureCount = 0;
        this.failures.length = 0;
        if (this.currentState === i_circuit_breaker_port_1.CircuitState.HALF_OPEN) {
            this.halfOpenCalls++;
            if (this.halfOpenCalls >= this.config.halfOpenMaxCalls ||
                this.successCount + 1 >= this.config.successThreshold) {
                this.transitionTo(i_circuit_breaker_port_1.CircuitState.CLOSED);
                this.successCount = 0;
                return { transition: true, to: i_circuit_breaker_port_1.CircuitState.CLOSED, reason: 'success_threshold' };
            }
        }
        else if (this.currentState === i_circuit_breaker_port_1.CircuitState.CLOSED) {
            this.successCount++;
        }
        return { transition: false };
    }
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
    recordFailure(currentTime) {
        this.failureCount++;
        this.lastFailureTime = currentTime;
        this.failures.push(currentTime);
        this.cleanOldFailures(currentTime);
        if (this.currentState === i_circuit_breaker_port_1.CircuitState.CLOSED && this.shouldOpenCircuit()) {
            this.transitionTo(i_circuit_breaker_port_1.CircuitState.OPEN);
            this.nextAttemptTime = currentTime + this.config.openTimeout;
            return { transition: true, to: i_circuit_breaker_port_1.CircuitState.OPEN, reason: 'threshold_exceeded' };
        }
        else if (this.currentState === i_circuit_breaker_port_1.CircuitState.HALF_OPEN) {
            this.transitionTo(i_circuit_breaker_port_1.CircuitState.OPEN);
            this.nextAttemptTime = currentTime + this.config.openTimeout;
            return { transition: true, to: i_circuit_breaker_port_1.CircuitState.OPEN, reason: 'threshold_exceeded' };
        }
        return { transition: false };
    }
    /**
     * Переходит в новое состояние
     *
     * @param newState - Новое состояние
     *
     * @remarks
     * Обновляет lastStateChange при изменении.
     */
    transitionTo(newState) {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.lastStateChange = this.now();
        }
    }
    /**
     * Сбрасывает состояние в начальное
     *
     * @remarks
     * Используется для ручного восстановления.
     */
    reset() {
        this.currentState = i_circuit_breaker_port_1.CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.halfOpenCalls = 0;
        this.failures.length = 0;
        this.lastStateChange = this.now();
    }
    /**
     * Удаляет устаревшие записи о неудачах
     *
     * @param currentTime - Текущее время
     *
     * @remarks
     * Удаляет записи старше slidingWindowSize.
     */
    cleanOldFailures(currentTime) {
        const windowStart = currentTime - this.config.slidingWindowSize;
        while (this.failures.length > 0 && this.failures[0] < windowStart) {
            this.failures.shift();
        }
    }
    /**
     * Проверяет, нужно ли открыть цепь
     *
     * @returns true если нужно открыть
     *
     * @remarks
     * Проверяет порог неудач.
     */
    shouldOpenCircuit() {
        return this.failureCount >= this.config.failureThreshold;
    }
    /**
     * Возвращает статистику для мониторинга
     *
     * @returns Статистика circuit breaker
     */
    getStats() {
        return {
            state: this.currentState,
            failureCount: this.failureCount,
            successCount: this.successCount,
            failuresInWindow: this.failures.length,
            lastFailureTime: this.lastFailureTime,
            lastStateChange: this.lastStateChange,
            nextAttemptTime: this.nextAttemptTime
        };
    }
}
exports.CircuitStateStorage = CircuitStateStorage;
