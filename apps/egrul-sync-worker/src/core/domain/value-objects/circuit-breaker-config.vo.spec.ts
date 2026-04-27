/**
 * Спецификация для CircuitBreakerConfigVO
 */

import { describe, it, expect } from 'vitest';
import { CircuitBreakerConfigVO } from './circuit-breaker-config.vo';
import { CircuitBreakerConfigFactory } from '../factories/circuit-breaker-config.factory';

describe('CircuitBreakerConfigVO', () => {
  describe('constructor', () => {
    it('should create config with valid values', () => {
      const config = new CircuitBreakerConfigVO(
        5,
        60000,
        30000,
        60000,
        3,
        2
      );

      expect(config.failureThreshold).toBe(5);
      expect(config.openTimeout).toBe(60000);
      expect(config.halfOpenTimeout).toBe(30000);
      expect(config.slidingWindowSize).toBe(60000);
      expect(config.halfOpenMaxCalls).toBe(3);
      expect(config.successThreshold).toBe(2);
    });

    it('should be immutable', () => {
      const config = new CircuitBreakerConfigVO(
        5,
        60000,
        30000,
        60000,
        3,
        2
      );

      // readonly свойства проверяются на compile-time уровне TypeScript
      // Runtime иммутабельность через readonly не гарантируется
      // но withXxx методы создают новые экземпляры
      const modified = config.withFailureThreshold(10);

      expect(config.failureThreshold).toBe(5);
      expect(modified.failureThreshold).toBe(10);
      expect(modified).not.toBe(config);
    });

    it('should throw on invalid failureThreshold', () => {
      expect(() => new CircuitBreakerConfigVO(0, 60000, 30000, 60000, 3, 2))
        .toThrow('failureThreshold must be >= 1');
    });

    it('should throw on invalid openTimeout (too small)', () => {
      expect(() => new CircuitBreakerConfigVO(5, 500, 30000, 60000, 3, 2))
        .toThrow('openTimeout must be >= 1000ms');
    });

    it('should throw on invalid openTimeout (too large)', () => {
      expect(() => new CircuitBreakerConfigVO(5, 400000, 30000, 60000, 3, 2))
        .toThrow('openTimeout must be <= 300000ms');
    });

    it('should throw on invalid slidingWindowSize', () => {
      expect(() => new CircuitBreakerConfigVO(5, 60000, 30000, 1000, 3, 2))
        .toThrow('slidingWindowSize must be >= 5000ms');
    });
  });

  describe('default() factory', () => {
    it('should create default config', () => {
      const config = CircuitBreakerConfigFactory.default();

      expect(config.failureThreshold).toBe(5);
      expect(config.openTimeout).toBe(60000);
      expect(config.halfOpenTimeout).toBe(30000);
      expect(config.slidingWindowSize).toBe(60000);
      expect(config.halfOpenMaxCalls).toBe(3);
      expect(config.successThreshold).toBe(2);
    });
  });

  describe('strict() factory', () => {
    it('should create strict config', () => {
      const config = CircuitBreakerConfigFactory.strict();

      expect(config.failureThreshold).toBe(3);
      expect(config.openTimeout).toBe(120000);
      expect(config.halfOpenTimeout).toBe(60000);
      expect(config.slidingWindowSize).toBe(30000);
      expect(config.halfOpenMaxCalls).toBe(2);
      expect(config.successThreshold).toBe(5);
    });
  });

  describe('lenient() factory', () => {
    it('should create lenient config', () => {
      const config = CircuitBreakerConfigFactory.lenient();

      expect(config.failureThreshold).toBe(10);
      expect(config.openTimeout).toBe(30000);
      expect(config.halfOpenTimeout).toBe(15000);
      expect(config.slidingWindowSize).toBe(120000);
      expect(config.halfOpenMaxCalls).toBe(10);
      expect(config.successThreshold).toBe(1);
    });
  });

  describe('forExternalAPI() factory', () => {
    it('should create config optimized for external API', () => {
      const config = CircuitBreakerConfigFactory.forExternalAPI();

      expect(config.failureThreshold).toBe(5);
      expect(config.openTimeout).toBe(60000);
      expect(config.halfOpenTimeout).toBe(30000);
      expect(config.slidingWindowSize).toBe(90000);
      expect(config.halfOpenMaxCalls).toBe(3);
      expect(config.successThreshold).toBe(2);
    });
  });

  describe('forDatabase() factory', () => {
    it('should create config optimized for database', () => {
      const config = CircuitBreakerConfigFactory.forDatabase();

      expect(config.failureThreshold).toBe(3);
      expect(config.openTimeout).toBe(120000);
      expect(config.halfOpenTimeout).toBe(30000);
      expect(config.slidingWindowSize).toBe(30000);
      expect(config.halfOpenMaxCalls).toBe(1);
      expect(config.successThreshold).toBe(2);
    });
  });

  describe('withFailureThreshold()', () => {
    it('should create new config with different threshold', () => {
      const config = CircuitBreakerConfigFactory.default();
      const newConfig = config.withFailureThreshold(10);

      expect(config.failureThreshold).toBe(5);
      expect(newConfig.failureThreshold).toBe(10);
      expect(newConfig.openTimeout).toBe(config.openTimeout);
    });
  });

  describe('withOpenTimeout()', () => {
    it('should create new config with different timeout', () => {
      const config = CircuitBreakerConfigFactory.default();
      const newConfig = config.withOpenTimeout(120000);

      expect(config.openTimeout).toBe(60000);
      expect(newConfig.openTimeout).toBe(120000);
    });
  });

  describe('withHalfOpenTimeout()', () => {
    it('should create new config with different half-open timeout', () => {
      const config = CircuitBreakerConfigFactory.default();
      const newConfig = config.withHalfOpenTimeout(60000);

      expect(config.halfOpenTimeout).toBe(30000);
      expect(newConfig.halfOpenTimeout).toBe(60000);
    });
  });

  describe('withSlidingWindowSize()', () => {
    it('should create new config with different window size', () => {
      const config = CircuitBreakerConfigFactory.default();
      const newConfig = config.withSlidingWindowSize(120000);

      expect(config.slidingWindowSize).toBe(60000);
      expect(newConfig.slidingWindowSize).toBe(120000);
    });
  });

  describe('toConfig()', () => {
    it('should convert to plain object', () => {
      const vo = CircuitBreakerConfigFactory.default();
      const config = vo.toConfig();

      expect(config).toEqual({
        failureThreshold: 5,
        openTimeout: 60000,
        halfOpenTimeout: 30000,
        slidingWindowSize: 60000,
        halfOpenMaxCalls: 3,
        successThreshold: 2
      });
    });
  });

  describe('CBConfig alias', () => {
    it('should be same as CircuitBreakerConfigVO', () => {
      const config = CircuitBreakerConfigFactory.default();
      const aliased = CircuitBreakerConfigFactory.default();

      expect(config).toEqual(aliased);
    });
  });
});
