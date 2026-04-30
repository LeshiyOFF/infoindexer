"use strict";
/**
 * Circuit Breaker Factory
 *
 * @remarks
 * Factory for creating configured Circuit Breaker instances.
 * Follows SRP: Responsible only for component creation.
 *
 * Provides factory methods for common use cases.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerFactory = void 0;
exports.createCircuitBreaker = createCircuitBreaker;
exports.createCircuitBreakerForClickHouse = createCircuitBreakerForClickHouse;
exports.createCircuitBreakerForAPI = createCircuitBreakerForAPI;
exports.createNullCircuitBreaker = createNullCircuitBreaker;
const circuit_breaker_config_vo_1 = require("../domain/value-objects/circuit-breaker-config.vo");
const circuit_breaker_adapter_1 = require("../adapters/circuit-breaker.adapter");
const null_circuit_breaker_adapter_1 = require("../adapters/null-circuit-breaker.adapter");
/**
 * Circuit Breaker Factory
 *
 * @remarks
 * Creates configured Circuit Breaker instances.
 * Use factory methods for specific use cases.
 */
class CircuitBreakerFactory {
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
        const defaultConfig = circuit_breaker_config_vo_1.CircuitBreakerConfigVO.default();
        if (config) {
            const merged = new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(config.failureThreshold ?? defaultConfig.failureThreshold, config.openTimeout ?? defaultConfig.openTimeout, config.halfOpenTimeout ?? defaultConfig.halfOpenTimeout, config.slidingWindowSize ?? defaultConfig.slidingWindowSize, config.halfOpenMaxCalls ?? defaultConfig.halfOpenMaxCalls, config.successThreshold ?? defaultConfig.successThreshold);
            return new circuit_breaker_adapter_1.CircuitBreakerAdapter(name, merged, enableMetrics, events);
        }
        return new circuit_breaker_adapter_1.CircuitBreakerAdapter(name, defaultConfig, enableMetrics, events);
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
        return new circuit_breaker_adapter_1.CircuitBreakerAdapter(name, circuit_breaker_config_vo_1.CircuitBreakerConfigVO.forClickHouse(), enableMetrics, events);
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
        return new circuit_breaker_adapter_1.CircuitBreakerAdapter(name, circuit_breaker_config_vo_1.CircuitBreakerConfigVO.forAPI(), enableMetrics, events);
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
        return new circuit_breaker_adapter_1.CircuitBreakerAdapter(name, circuit_breaker_config_vo_1.CircuitBreakerConfigVO.forTesting(), false, events);
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
        return new null_circuit_breaker_adapter_1.NullCircuitBreakerAdapter(name);
    }
}
exports.CircuitBreakerFactory = CircuitBreakerFactory;
// Convenience functions for direct usage
/**
 * Create Circuit Breaker with default config
 */
function createCircuitBreaker(name, config) {
    return CircuitBreakerFactory.create(name, config);
}
/**
 * Create Circuit Breaker for ClickHouse
 */
function createCircuitBreakerForClickHouse(name) {
    return CircuitBreakerFactory.forClickHouse(name);
}
/**
 * Create Circuit Breaker for API
 */
function createCircuitBreakerForAPI(name) {
    return CircuitBreakerFactory.forAPI(name);
}
/**
 * Create Null Circuit Breaker
 */
function createNullCircuitBreaker(name) {
    return CircuitBreakerFactory.null(name);
}
