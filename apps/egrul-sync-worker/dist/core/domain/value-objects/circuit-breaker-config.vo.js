"use strict";
/**
 * Value Object для конфигурации Circuit Breaker
 *
 * @remarks
 * Immutable Value Object (DDD pattern).
 * Следует SRP: ответственен только за хранение конфигурации.
 * Все свойства readonly для иммутабельности.
 * Validation в constructor для гарантии корректности.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CBConfig = exports.CircuitBreakerConfigVO = void 0;
/**
 * Value Object для конфигурации Circuit Breaker
 *
 * @remarks
 * Реализует CircuitBreakerConfig как Value Object.
 * Проверяет валидность значений в constructor.
 * Предоставляет withXxx методы для иммутабельного изменения.
 *
 * @example
 * ```ts
 * const config = new CircuitBreakerConfigVO(5, 60000, 30000, 60000, 3, 2);
 * const withTimeout = config.withOpenTimeout(120000);
 * ```
 */
class CircuitBreakerConfigVO {
    failureThreshold;
    openTimeout;
    halfOpenTimeout;
    slidingWindowSize;
    halfOpenMaxCalls;
    successThreshold;
    // Constants для валидации
    static MIN_THRESHOLD = 1;
    static MIN_TIMEOUT = 1000;
    static MAX_TIMEOUT = 300000;
    static MIN_WINDOW_SIZE = 5000;
    static MAX_WINDOW_SIZE = 300000;
    constructor(failureThreshold, openTimeout, halfOpenTimeout, slidingWindowSize, halfOpenMaxCalls, successThreshold) {
        this.failureThreshold = failureThreshold;
        this.openTimeout = openTimeout;
        this.halfOpenTimeout = halfOpenTimeout;
        this.slidingWindowSize = slidingWindowSize;
        this.halfOpenMaxCalls = halfOpenMaxCalls;
        this.successThreshold = successThreshold;
        this.validateFailureThreshold(failureThreshold);
        this.validateTimeout(openTimeout, 'openTimeout');
        this.validateTimeout(halfOpenTimeout, 'halfOpenTimeout');
        this.validateWindowSize(slidingWindowSize);
        this.validatePositive(halfOpenMaxCalls, 'halfOpenMaxCalls');
        this.validatePositive(successThreshold, 'successThreshold');
    }
    withFailureThreshold(value) {
        return new CircuitBreakerConfigVO(value, this.openTimeout, this.halfOpenTimeout, this.slidingWindowSize, this.halfOpenMaxCalls, this.successThreshold);
    }
    withOpenTimeout(value) {
        return new CircuitBreakerConfigVO(this.failureThreshold, value, this.halfOpenTimeout, this.slidingWindowSize, this.halfOpenMaxCalls, this.successThreshold);
    }
    withHalfOpenTimeout(value) {
        return new CircuitBreakerConfigVO(this.failureThreshold, this.openTimeout, value, this.slidingWindowSize, this.halfOpenMaxCalls, this.successThreshold);
    }
    withSlidingWindowSize(value) {
        return new CircuitBreakerConfigVO(this.failureThreshold, this.openTimeout, this.halfOpenTimeout, value, this.halfOpenMaxCalls, this.successThreshold);
    }
    toConfig() {
        return {
            failureThreshold: this.failureThreshold,
            openTimeout: this.openTimeout,
            halfOpenTimeout: this.halfOpenTimeout,
            slidingWindowSize: this.slidingWindowSize,
            halfOpenMaxCalls: this.halfOpenMaxCalls,
            successThreshold: this.successThreshold
        };
    }
    // Validation methods
    validateFailureThreshold(value) {
        if (value < CircuitBreakerConfigVO.MIN_THRESHOLD) {
            throw new Error(`failureThreshold must be >= ${CircuitBreakerConfigVO.MIN_THRESHOLD}, got ${value}`);
        }
    }
    validateTimeout(value, name) {
        if (value < CircuitBreakerConfigVO.MIN_TIMEOUT) {
            throw new Error(`${name} must be >= ${CircuitBreakerConfigVO.MIN_TIMEOUT}ms, got ${value}ms`);
        }
        if (value > CircuitBreakerConfigVO.MAX_TIMEOUT) {
            throw new Error(`${name} must be <= ${CircuitBreakerConfigVO.MAX_TIMEOUT}ms, got ${value}ms`);
        }
    }
    validateWindowSize(value) {
        if (value < CircuitBreakerConfigVO.MIN_WINDOW_SIZE) {
            throw new Error(`slidingWindowSize must be >= ${CircuitBreakerConfigVO.MIN_WINDOW_SIZE}ms, got ${value}ms`);
        }
        if (value > CircuitBreakerConfigVO.MAX_WINDOW_SIZE) {
            throw new Error(`slidingWindowSize must be <= ${CircuitBreakerConfigVO.MAX_WINDOW_SIZE}ms, got ${value}ms`);
        }
    }
    validatePositive(value, name) {
        if (value < 1) {
            throw new Error(`${name} must be >= 1, got ${value}`);
        }
    }
}
exports.CircuitBreakerConfigVO = CircuitBreakerConfigVO;
/**
 * Алиас для краткости
 */
exports.CBConfig = CircuitBreakerConfigVO;
