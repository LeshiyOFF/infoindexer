"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerConfig = void 0;
/**
 * Circuit Breaker Configuration Value Object
 *
 * @remarks
 * Immutable конфигурация для Circuit Breaker.
 * Следует SRP: только хранение и валидация параметров.
 * Следует Value Object pattern: нет идентичности, равенство по значениям.
 * Следует OCP: factory методы для создания конфигураций.
 *
 * Значения по умолчанию основаны на рекомендациях Netflix Hystrix:
 * - failureThreshold: 5 отказов перед открытием
 * - successThreshold: 2 успеха для закрытия из half-open
 * - timeoutMs: 60000мс (1 минута) перед попыткой восстановления
 * - halfOpenAttempts: 3 попыток в состоянии half-open
 */
class CircuitBreakerConfig {
    static DEFAULT_FAILURE_THRESHOLD = 5;
    static DEFAULT_SUCCESS_THRESHOLD = 2;
    static DEFAULT_TIMEOUT_MS = 60000;
    static DEFAULT_HALF_OPEN_ATTEMPTS = 3;
    static MIN_FAILURE_THRESHOLD = 1;
    static MAX_FAILURE_THRESHOLD = 100;
    failureThreshold;
    successThreshold;
    timeoutMs;
    halfOpenAttempts;
    constructor(failureThreshold = CircuitBreakerConfig.DEFAULT_FAILURE_THRESHOLD, successThreshold = CircuitBreakerConfig.DEFAULT_SUCCESS_THRESHOLD, timeoutMs = CircuitBreakerConfig.DEFAULT_TIMEOUT_MS, halfOpenAttempts = CircuitBreakerConfig.DEFAULT_HALF_OPEN_ATTEMPTS) {
        this.validateFailureThreshold(failureThreshold);
        this.validateSuccessThreshold(successThreshold);
        this.validateTimeout(timeoutMs);
        this.validateHalfOpenAttempts(halfOpenAttempts);
        this.failureThreshold = failureThreshold;
        this.successThreshold = successThreshold;
        this.timeoutMs = timeoutMs;
        this.halfOpenAttempts = halfOpenAttempts;
    }
    /**
     * Создать конфигурацию с кастомным порогом отказов
     */
    static withFailureThreshold(threshold) {
        return new CircuitBreakerConfig(threshold, CircuitBreakerConfig.DEFAULT_SUCCESS_THRESHOLD, CircuitBreakerConfig.DEFAULT_TIMEOUT_MS, CircuitBreakerConfig.DEFAULT_HALF_OPEN_ATTEMPTS);
    }
    /**
     * Создать конфигурацию для тестирования (быстрое восстановление)
     */
    static forTesting() {
        return new CircuitBreakerConfig(2, // Быстрое открытие
        1, // Быстрое закрытие
        1000, // 1 секунда timeout
        2 // 2 попытки
        );
    }
    validateFailureThreshold(value) {
        if (value < CircuitBreakerConfig.MIN_FAILURE_THRESHOLD ||
            value > CircuitBreakerConfig.MAX_FAILURE_THRESHOLD) {
            throw new RangeError(`failureThreshold must be between ${CircuitBreakerConfig.MIN_FAILURE_THRESHOLD} ` +
                `and ${CircuitBreakerConfig.MAX_FAILURE_THRESHOLD}`);
        }
    }
    validateSuccessThreshold(value) {
        if (value < 1 || value > 10) {
            throw new RangeError('successThreshold must be between 1 and 10');
        }
    }
    validateTimeout(value) {
        if (value < 100 || value > 600000) {
            throw new RangeError('timeoutMs must be between 100 and 600000');
        }
    }
    validateHalfOpenAttempts(value) {
        if (value < 1 || value > 10) {
            throw new RangeError('halfOpenAttempts must be between 1 and 10');
        }
    }
}
exports.CircuitBreakerConfig = CircuitBreakerConfig;
