"use strict";
/**
 * Circuit Breaker State Management
 *
 * Выделен в отдельный класс по SRP.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitStateStorage = void 0;
const circuit_breaker_types_1 = require("./circuit-breaker-types");
/**
 * Хранилище состояния Circuit Breaker
 */
class CircuitStateStorage {
    config;
    now;
    currentState = circuit_breaker_types_1.CircuitState.CLOSED;
    failureCount = 0;
    successCount = 0;
    lastFailureTime = 0;
    lastStateChange;
    nextAttemptTime = 0;
    failures = [];
    constructor(config, now) {
        this.config = config;
        this.now = now;
        this.lastStateChange = now();
    }
    /** Проверяет нужно ли переход из OPEN в HALF_OPEN */
    shouldAttemptTransition(currentTime) {
        return this.currentState === 'open' && currentTime >= this.nextAttemptTime;
    }
    /** Обработка успешного выполнения */
    onSuccess() {
        this.failureCount = 0;
        this.failures.length = 0;
        if (this.currentState === circuit_breaker_types_1.CircuitState.HALF_OPEN) {
            this.transitionTo(circuit_breaker_types_1.CircuitState.CLOSED);
            this.successCount = 0;
        }
        else if (this.currentState === circuit_breaker_types_1.CircuitState.CLOSED) {
            this.successCount++;
        }
    }
    /** Обработка неудачного выполнения */
    onFailure(currentTime) {
        this.failureCount++;
        this.lastFailureTime = currentTime;
        this.failures.push(currentTime);
        this.cleanOldFailures(currentTime);
        if (this.shouldOpenCircuit()) {
            this.transitionTo(circuit_breaker_types_1.CircuitState.OPEN);
            this.nextAttemptTime = currentTime + this.config.openTimeout;
        }
        else if (this.currentState === circuit_breaker_types_1.CircuitState.HALF_OPEN) {
            this.transitionTo(circuit_breaker_types_1.CircuitState.OPEN);
            this.nextAttemptTime = currentTime + this.config.openTimeout;
        }
    }
    /** Очищает старые записи за пределами окна */
    cleanOldFailures(currentTime) {
        const windowStart = currentTime - this.config.slidingWindowSize;
        while (this.failures.length > 0 && this.failures[0] < windowStart) {
            this.failures.shift();
        }
    }
    /** Проверяет порог для открытия цепи */
    shouldOpenCircuit() {
        return (this.currentState === circuit_breaker_types_1.CircuitState.CLOSED &&
            this.failureCount >= this.config.failureThreshold);
    }
    /** Переход в новое состояние */
    transitionTo(newState) {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.lastStateChange = this.now();
        }
    }
    /** Сброс состояния */
    reset() {
        this.currentState = circuit_breaker_types_1.CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.failures.length = 0;
        this.lastStateChange = this.now();
    }
    /** Статистика */
    getStats() {
        return {
            state: this.currentState,
            failureCount: this.failureCount,
            successCount: this.successCount,
            failuresInWindow: this.failures.length,
            lastFailureTime: this.lastFailureTime,
            lastStateChange: this.lastStateChange
        };
    }
}
exports.CircuitStateStorage = CircuitStateStorage;
