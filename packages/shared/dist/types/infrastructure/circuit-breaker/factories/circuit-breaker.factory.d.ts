/**
 * Circuit Breaker Factory
 *
 * @remarks
 * Factory for creating configured Circuit Breaker instances.
 * Follows SRP: Responsible only for component creation.
 *
 * Provides factory methods for common use cases.
 */
import type { CircuitBreakerConfig } from '../domain/types/circuit-breaker.types';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import type { ICircuitBreakerEventsPort } from '../ports/i-circuit-breaker-events.port';
/**
 * Circuit Breaker Factory
 *
 * @remarks
 * Creates configured Circuit Breaker instances.
 * Use factory methods for specific use cases.
 */
export declare class CircuitBreakerFactory {
    /**
     * Create Circuit Breaker with custom config
     *
     * @param name - Circuit breaker name
     * @param config - Configuration (partial merged with defaults)
     * @param enableMetrics - Enable metrics recording
     * @param events - Optional events handler
     * @returns Circuit breaker instance
     */
    static create(name: string, config?: Partial<CircuitBreakerConfig>, enableMetrics?: boolean, events?: ICircuitBreakerEventsPort): ICircuitBreakerPort;
    /**
     * Create Circuit Breaker for ClickHouse operations
     *
     * @param name - Circuit breaker name
     * @param enableMetrics - Enable metrics recording
     * @param events - Optional events handler
     * @returns Circuit breaker instance
     *
     * @remarks
     * Optimized for database operations:
     * - Lower failure threshold (3)
     * - Shorter timeouts (30s open, 15s half-open)
     */
    static forClickHouse(name: string, enableMetrics?: boolean, events?: ICircuitBreakerEventsPort): ICircuitBreakerPort;
    /**
     * Create Circuit Breaker for API endpoints
     *
     * @param name - Circuit breaker name
     * @param enableMetrics - Enable metrics recording
     * @param events - Optional events handler
     * @returns Circuit breaker instance
     *
     * @remarks
     * Optimized for API calls:
     * - Higher failure threshold (10)
     * - Longer timeouts (60s open, 30s half-open)
     * - Larger sliding window (2 min)
     */
    static forAPI(name: string, enableMetrics?: boolean, events?: ICircuitBreakerEventsPort): ICircuitBreakerPort;
    /**
     * Create Circuit Breaker for testing
     *
     * @param name - Circuit breaker name
     * @param events - Optional events handler
     * @returns Circuit breaker instance
     *
     * @remarks
     * Fast configuration for testing:
     * - Low thresholds (2)
     * - Short timeouts (1s open, 0.5s half-open)
     * - Metrics disabled by default
     */
    static forTesting(name: string, events?: ICircuitBreakerEventsPort): ICircuitBreakerPort;
    /**
     * Create Null Circuit Breaker (no protection)
     *
     * @param name - Circuit breaker name
     * @returns Null circuit breaker instance
     *
     * @remarks
     * Null Object Pattern: Always allows execution.
     * Useful for testing and development.
     */
    static null(name?: string): ICircuitBreakerPort;
}
/**
 * Create Circuit Breaker with default config
 */
export declare function createCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): ICircuitBreakerPort;
/**
 * Create Circuit Breaker for ClickHouse
 */
export declare function createCircuitBreakerForClickHouse(name: string): ICircuitBreakerPort;
/**
 * Create Circuit Breaker for API
 */
export declare function createCircuitBreakerForAPI(name: string): ICircuitBreakerPort;
/**
 * Create Null Circuit Breaker
 */
export declare function createNullCircuitBreaker(name?: string): ICircuitBreakerPort;
