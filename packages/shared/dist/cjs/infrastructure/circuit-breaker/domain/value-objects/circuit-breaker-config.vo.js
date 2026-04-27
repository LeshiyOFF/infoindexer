"use strict";
/**
 * Circuit Breaker Configuration Value Object
 *
 * @remarks
 * Immutable Value Object (DDD pattern).
 * Follows SRP: Responsible only for configuration storage.
 * All properties readonly for immutability.
 * Validation in constructor ensures correctness.
 *
 * @example
 * ```ts
 * const config = new CircuitBreakerConfigVO(5, 60000, 30000, 60000, 3, 2);
 * const withTimeout = config.withOpenTimeout(120000);
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CBConfig = exports.CircuitBreakerConfigVO = void 0;
/**
 * Circuit Breaker Configuration Value Object
 *
 * @remarks
 * Implements CircuitBreakerConfig as Value Object.
 * Validates values in constructor.
 * Provides withXxx methods for immutable modification.
 */
class CircuitBreakerConfigVO {
    failureThreshold;
    openTimeout;
    halfOpenTimeout;
    slidingWindowSize;
    halfOpenMaxCalls;
    successThreshold;
    // Validation constants
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
    /**
     * Create with custom failure threshold
     */
    withFailureThreshold(value) {
        return new CircuitBreakerConfigVO(value, this.openTimeout, this.halfOpenTimeout, this.slidingWindowSize, this.halfOpenMaxCalls, this.successThreshold);
    }
    /**
     * Create with custom open timeout
     */
    withOpenTimeout(value) {
        return new CircuitBreakerConfigVO(this.failureThreshold, value, this.halfOpenTimeout, this.slidingWindowSize, this.halfOpenMaxCalls, this.successThreshold);
    }
    /**
     * Create with custom half-open timeout
     */
    withHalfOpenTimeout(value) {
        return new CircuitBreakerConfigVO(this.failureThreshold, this.openTimeout, value, this.slidingWindowSize, this.halfOpenMaxCalls, this.successThreshold);
    }
    /**
     * Create with custom sliding window size
     */
    withSlidingWindowSize(value) {
        return new CircuitBreakerConfigVO(this.failureThreshold, this.openTimeout, this.halfOpenTimeout, value, this.halfOpenMaxCalls, this.successThreshold);
    }
    /**
     * Convert to plain config interface
     */
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
    // Factory methods
    /**
     * Default configuration for production
     */
    static default() {
        return new CircuitBreakerConfigVO(5, // failureThreshold
        60000, // openTimeout (1 min)
        30000, // halfOpenTimeout (30 sec)
        60000, // slidingWindowSize (1 min)
        3, // halfOpenMaxCalls
        2 // successThreshold
        );
    }
    /**
     * Fast configuration for testing
     */
    static forTesting() {
        return new CircuitBreakerConfigVO(2, // failureThreshold (quick to open)
        1000, // openTimeout (1 sec)
        500, // halfOpenTimeout (0.5 sec)
        5000, // slidingWindowSize (5 sec)
        2, // halfOpenMaxCalls
        1 // successThreshold (quick to close)
        );
    }
    /**
     * Configuration for ClickHouse operations
     */
    static forClickHouse() {
        return new CircuitBreakerConfigVO(3, // failureThreshold
        30000, // openTimeout (30 sec)
        15000, // halfOpenTimeout (15 sec)
        60000, // slidingWindowSize (1 min)
        2, // halfOpenMaxCalls
        2 // successThreshold
        );
    }
    /**
     * Configuration for API endpoints
     */
    static forAPI() {
        return new CircuitBreakerConfigVO(10, // failureThreshold
        60000, // openTimeout (1 min)
        30000, // halfOpenTimeout (30 sec)
        120000, // slidingWindowSize (2 min)
        5, // halfOpenMaxCalls
        3 // successThreshold
        );
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
 * Alias for brevity
 */
exports.CBConfig = CircuitBreakerConfigVO;
