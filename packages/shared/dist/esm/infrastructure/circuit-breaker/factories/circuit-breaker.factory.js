/**
 * Circuit Breaker Factory
 *
 * @remarks
 * Factory for creating configured Circuit Breaker instances.
 * Follows SRP: Responsible only for component creation.
 *
 * Provides factory methods for common use cases.
 */
import { CircuitBreakerConfigVO } from '../domain/value-objects/circuit-breaker-config.vo';
import { CircuitBreakerAdapter } from '../adapters/circuit-breaker.adapter';
import { NullCircuitBreakerAdapter } from '../adapters/null-circuit-breaker.adapter';
/**
 * Circuit Breaker Factory
 *
 * @remarks
 * Creates configured Circuit Breaker instances.
 * Use factory methods for specific use cases.
 */
export class CircuitBreakerFactory {
    /**
     * Create Circuit Breaker with custom config
     *
     * @param name - Circuit breaker name
     * @param config - Configuration (partial merged with defaults)
     * @param enableMetrics - Enable metrics recording
     * @param events - Optional events handler
     * @returns Circuit breaker instance
     */
    static create(name, config, enableMetrics = true, events) {
        const defaultConfig = CircuitBreakerConfigVO.default();
        if (config) {
            const merged = new CircuitBreakerConfigVO(config.failureThreshold ?? defaultConfig.failureThreshold, config.openTimeout ?? defaultConfig.openTimeout, config.halfOpenTimeout ?? defaultConfig.halfOpenTimeout, config.slidingWindowSize ?? defaultConfig.slidingWindowSize, config.halfOpenMaxCalls ?? defaultConfig.halfOpenMaxCalls, config.successThreshold ?? defaultConfig.successThreshold);
            return new CircuitBreakerAdapter(name, merged, enableMetrics, events);
        }
        return new CircuitBreakerAdapter(name, defaultConfig, enableMetrics, events);
    }
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
    static forClickHouse(name, enableMetrics = true, events) {
        return new CircuitBreakerAdapter(name, CircuitBreakerConfigVO.forClickHouse(), enableMetrics, events);
    }
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
    static forAPI(name, enableMetrics = true, events) {
        return new CircuitBreakerAdapter(name, CircuitBreakerConfigVO.forAPI(), enableMetrics, events);
    }
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
    static forTesting(name, events) {
        return new CircuitBreakerAdapter(name, CircuitBreakerConfigVO.forTesting(), false, events);
    }
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
    static null(name = 'null-circuit-breaker') {
        return new NullCircuitBreakerAdapter(name);
    }
}
// Convenience functions for direct usage
/**
 * Create Circuit Breaker with default config
 */
export function createCircuitBreaker(name, config) {
    return CircuitBreakerFactory.create(name, config);
}
/**
 * Create Circuit Breaker for ClickHouse
 */
export function createCircuitBreakerForClickHouse(name) {
    return CircuitBreakerFactory.forClickHouse(name);
}
/**
 * Create Circuit Breaker for API
 */
export function createCircuitBreakerForAPI(name) {
    return CircuitBreakerFactory.forAPI(name);
}
/**
 * Create Null Circuit Breaker
 */
export function createNullCircuitBreaker(name) {
    return CircuitBreakerFactory.null(name);
}
