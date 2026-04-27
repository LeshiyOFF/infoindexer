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
import type { CircuitBreakerConfig } from '../types/circuit-breaker.types';
/**
 * Circuit Breaker Configuration Value Object
 *
 * @remarks
 * Implements CircuitBreakerConfig as Value Object.
 * Validates values in constructor.
 * Provides withXxx methods for immutable modification.
 */
export declare class CircuitBreakerConfigVO implements CircuitBreakerConfig {
    readonly failureThreshold: number;
    readonly openTimeout: number;
    readonly halfOpenTimeout: number;
    readonly slidingWindowSize: number;
    readonly halfOpenMaxCalls: number;
    readonly successThreshold: number;
    private static readonly MIN_THRESHOLD;
    private static readonly MIN_TIMEOUT;
    private static readonly MAX_TIMEOUT;
    private static readonly MIN_WINDOW_SIZE;
    private static readonly MAX_WINDOW_SIZE;
    constructor(failureThreshold: number, openTimeout: number, halfOpenTimeout: number, slidingWindowSize: number, halfOpenMaxCalls: number, successThreshold: number);
    /**
     * Create with custom failure threshold
     */
    withFailureThreshold(value: number): CircuitBreakerConfigVO;
    /**
     * Create with custom open timeout
     */
    withOpenTimeout(value: number): CircuitBreakerConfigVO;
    /**
     * Create with custom half-open timeout
     */
    withHalfOpenTimeout(value: number): CircuitBreakerConfigVO;
    /**
     * Create with custom sliding window size
     */
    withSlidingWindowSize(value: number): CircuitBreakerConfigVO;
    /**
     * Convert to plain config interface
     */
    toConfig(): CircuitBreakerConfig;
    /**
     * Default configuration for production
     */
    static default(): CircuitBreakerConfigVO;
    /**
     * Fast configuration for testing
     */
    static forTesting(): CircuitBreakerConfigVO;
    /**
     * Configuration for ClickHouse operations
     */
    static forClickHouse(): CircuitBreakerConfigVO;
    /**
     * Configuration for API endpoints
     */
    static forAPI(): CircuitBreakerConfigVO;
    private validateFailureThreshold;
    private validateTimeout;
    private validateWindowSize;
    private validatePositive;
}
/**
 * Alias for brevity
 */
export declare const CBConfig: typeof CircuitBreakerConfigVO;
