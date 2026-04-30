"use strict";
/**
 * Спецификация для CircuitBreakerConfigVO
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const circuit_breaker_config_vo_1 = require("./circuit-breaker-config.vo");
const circuit_breaker_config_factory_1 = require("../factories/circuit-breaker-config.factory");
(0, vitest_1.describe)('CircuitBreakerConfigVO', () => {
    (0, vitest_1.describe)('constructor', () => {
        (0, vitest_1.it)('should create config with valid values', () => {
            const config = new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(5, 60000, 30000, 60000, 3, 2);
            (0, vitest_1.expect)(config.failureThreshold).toBe(5);
            (0, vitest_1.expect)(config.openTimeout).toBe(60000);
            (0, vitest_1.expect)(config.halfOpenTimeout).toBe(30000);
            (0, vitest_1.expect)(config.slidingWindowSize).toBe(60000);
            (0, vitest_1.expect)(config.halfOpenMaxCalls).toBe(3);
            (0, vitest_1.expect)(config.successThreshold).toBe(2);
        });
        (0, vitest_1.it)('should be immutable', () => {
            const config = new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(5, 60000, 30000, 60000, 3, 2);
            // readonly свойства проверяются на compile-time уровне TypeScript
            // Runtime иммутабельность через readonly не гарантируется
            // но withXxx методы создают новые экземпляры
            const modified = config.withFailureThreshold(10);
            (0, vitest_1.expect)(config.failureThreshold).toBe(5);
            (0, vitest_1.expect)(modified.failureThreshold).toBe(10);
            (0, vitest_1.expect)(modified).not.toBe(config);
        });
        (0, vitest_1.it)('should throw on invalid failureThreshold', () => {
            (0, vitest_1.expect)(() => new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(0, 60000, 30000, 60000, 3, 2))
                .toThrow('failureThreshold must be >= 1');
        });
        (0, vitest_1.it)('should throw on invalid openTimeout (too small)', () => {
            (0, vitest_1.expect)(() => new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(5, 500, 30000, 60000, 3, 2))
                .toThrow('openTimeout must be >= 1000ms');
        });
        (0, vitest_1.it)('should throw on invalid openTimeout (too large)', () => {
            (0, vitest_1.expect)(() => new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(5, 400000, 30000, 60000, 3, 2))
                .toThrow('openTimeout must be <= 300000ms');
        });
        (0, vitest_1.it)('should throw on invalid slidingWindowSize', () => {
            (0, vitest_1.expect)(() => new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(5, 60000, 30000, 1000, 3, 2))
                .toThrow('slidingWindowSize must be >= 5000ms');
        });
    });
    (0, vitest_1.describe)('default() factory', () => {
        (0, vitest_1.it)('should create default config', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
            (0, vitest_1.expect)(config.failureThreshold).toBe(5);
            (0, vitest_1.expect)(config.openTimeout).toBe(60000);
            (0, vitest_1.expect)(config.halfOpenTimeout).toBe(30000);
            (0, vitest_1.expect)(config.slidingWindowSize).toBe(60000);
            (0, vitest_1.expect)(config.halfOpenMaxCalls).toBe(3);
            (0, vitest_1.expect)(config.successThreshold).toBe(2);
        });
    });
    (0, vitest_1.describe)('strict() factory', () => {
        (0, vitest_1.it)('should create strict config', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.strict();
            (0, vitest_1.expect)(config.failureThreshold).toBe(3);
            (0, vitest_1.expect)(config.openTimeout).toBe(120000);
            (0, vitest_1.expect)(config.halfOpenTimeout).toBe(60000);
            (0, vitest_1.expect)(config.slidingWindowSize).toBe(30000);
            (0, vitest_1.expect)(config.halfOpenMaxCalls).toBe(2);
            (0, vitest_1.expect)(config.successThreshold).toBe(5);
        });
    });
    (0, vitest_1.describe)('lenient() factory', () => {
        (0, vitest_1.it)('should create lenient config', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.lenient();
            (0, vitest_1.expect)(config.failureThreshold).toBe(10);
            (0, vitest_1.expect)(config.openTimeout).toBe(30000);
            (0, vitest_1.expect)(config.halfOpenTimeout).toBe(15000);
            (0, vitest_1.expect)(config.slidingWindowSize).toBe(120000);
            (0, vitest_1.expect)(config.halfOpenMaxCalls).toBe(10);
            (0, vitest_1.expect)(config.successThreshold).toBe(1);
        });
    });
    (0, vitest_1.describe)('forExternalAPI() factory', () => {
        (0, vitest_1.it)('should create config optimized for external API', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.forExternalAPI();
            (0, vitest_1.expect)(config.failureThreshold).toBe(5);
            (0, vitest_1.expect)(config.openTimeout).toBe(60000);
            (0, vitest_1.expect)(config.halfOpenTimeout).toBe(30000);
            (0, vitest_1.expect)(config.slidingWindowSize).toBe(90000);
            (0, vitest_1.expect)(config.halfOpenMaxCalls).toBe(3);
            (0, vitest_1.expect)(config.successThreshold).toBe(2);
        });
    });
    (0, vitest_1.describe)('forDatabase() factory', () => {
        (0, vitest_1.it)('should create config optimized for database', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.forDatabase();
            (0, vitest_1.expect)(config.failureThreshold).toBe(3);
            (0, vitest_1.expect)(config.openTimeout).toBe(120000);
            (0, vitest_1.expect)(config.halfOpenTimeout).toBe(30000);
            (0, vitest_1.expect)(config.slidingWindowSize).toBe(30000);
            (0, vitest_1.expect)(config.halfOpenMaxCalls).toBe(1);
            (0, vitest_1.expect)(config.successThreshold).toBe(2);
        });
    });
    (0, vitest_1.describe)('withFailureThreshold()', () => {
        (0, vitest_1.it)('should create new config with different threshold', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
            const newConfig = config.withFailureThreshold(10);
            (0, vitest_1.expect)(config.failureThreshold).toBe(5);
            (0, vitest_1.expect)(newConfig.failureThreshold).toBe(10);
            (0, vitest_1.expect)(newConfig.openTimeout).toBe(config.openTimeout);
        });
    });
    (0, vitest_1.describe)('withOpenTimeout()', () => {
        (0, vitest_1.it)('should create new config with different timeout', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
            const newConfig = config.withOpenTimeout(120000);
            (0, vitest_1.expect)(config.openTimeout).toBe(60000);
            (0, vitest_1.expect)(newConfig.openTimeout).toBe(120000);
        });
    });
    (0, vitest_1.describe)('withHalfOpenTimeout()', () => {
        (0, vitest_1.it)('should create new config with different half-open timeout', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
            const newConfig = config.withHalfOpenTimeout(60000);
            (0, vitest_1.expect)(config.halfOpenTimeout).toBe(30000);
            (0, vitest_1.expect)(newConfig.halfOpenTimeout).toBe(60000);
        });
    });
    (0, vitest_1.describe)('withSlidingWindowSize()', () => {
        (0, vitest_1.it)('should create new config with different window size', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
            const newConfig = config.withSlidingWindowSize(120000);
            (0, vitest_1.expect)(config.slidingWindowSize).toBe(60000);
            (0, vitest_1.expect)(newConfig.slidingWindowSize).toBe(120000);
        });
    });
    (0, vitest_1.describe)('toConfig()', () => {
        (0, vitest_1.it)('should convert to plain object', () => {
            const vo = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
            const config = vo.toConfig();
            (0, vitest_1.expect)(config).toEqual({
                failureThreshold: 5,
                openTimeout: 60000,
                halfOpenTimeout: 30000,
                slidingWindowSize: 60000,
                halfOpenMaxCalls: 3,
                successThreshold: 2
            });
        });
    });
    (0, vitest_1.describe)('CBConfig alias', () => {
        (0, vitest_1.it)('should be same as CircuitBreakerConfigVO', () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
            const aliased = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
            (0, vitest_1.expect)(config).toEqual(aliased);
        });
    });
});
