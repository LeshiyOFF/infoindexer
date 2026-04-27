/**
 * Value Object для конфигурации Circuit Breaker
 *
 * @remarks
 * Immutable Value Object (DDD pattern).
 * Следует SRP: ответственен только за хранение конфигурации.
 * Все свойства readonly для иммутабельности.
 * Validation в constructor для гарантии корректности.
 */

import type { CircuitBreakerConfig } from '../../ports/i-circuit-breaker.port';

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
export class CircuitBreakerConfigVO implements CircuitBreakerConfig {
  // Constants для валидации
  private static readonly MIN_THRESHOLD = 1;
  private static readonly MIN_TIMEOUT = 1000;
  private static readonly MAX_TIMEOUT = 300000;
  private static readonly MIN_WINDOW_SIZE = 5000;
  private static readonly MAX_WINDOW_SIZE = 300000;

  constructor(
    public readonly failureThreshold: number,
    public readonly openTimeout: number,
    public readonly halfOpenTimeout: number,
    public readonly slidingWindowSize: number,
    public readonly halfOpenMaxCalls: number,
    public readonly successThreshold: number
  ) {
    this.validateFailureThreshold(failureThreshold);
    this.validateTimeout(openTimeout, 'openTimeout');
    this.validateTimeout(halfOpenTimeout, 'halfOpenTimeout');
    this.validateWindowSize(slidingWindowSize);
    this.validatePositive(halfOpenMaxCalls, 'halfOpenMaxCalls');
    this.validatePositive(successThreshold, 'successThreshold');
  }

  withFailureThreshold(value: number): CircuitBreakerConfigVO {
    return new CircuitBreakerConfigVO(
      value,
      this.openTimeout,
      this.halfOpenTimeout,
      this.slidingWindowSize,
      this.halfOpenMaxCalls,
      this.successThreshold
    );
  }

  withOpenTimeout(value: number): CircuitBreakerConfigVO {
    return new CircuitBreakerConfigVO(
      this.failureThreshold,
      value,
      this.halfOpenTimeout,
      this.slidingWindowSize,
      this.halfOpenMaxCalls,
      this.successThreshold
    );
  }

  withHalfOpenTimeout(value: number): CircuitBreakerConfigVO {
    return new CircuitBreakerConfigVO(
      this.failureThreshold,
      this.openTimeout,
      value,
      this.slidingWindowSize,
      this.halfOpenMaxCalls,
      this.successThreshold
    );
  }

  withSlidingWindowSize(value: number): CircuitBreakerConfigVO {
    return new CircuitBreakerConfigVO(
      this.failureThreshold,
      this.openTimeout,
      this.halfOpenTimeout,
      value,
      this.halfOpenMaxCalls,
      this.successThreshold
    );
  }

  toConfig(): CircuitBreakerConfig {
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

  private validateFailureThreshold(value: number): void {
    if (value < CircuitBreakerConfigVO.MIN_THRESHOLD) {
      throw new Error(
        `failureThreshold must be >= ${CircuitBreakerConfigVO.MIN_THRESHOLD}, got ${value}`
      );
    }
  }

  private validateTimeout(value: number, name: string): void {
    if (value < CircuitBreakerConfigVO.MIN_TIMEOUT) {
      throw new Error(
        `${name} must be >= ${CircuitBreakerConfigVO.MIN_TIMEOUT}ms, got ${value}ms`
      );
    }
    if (value > CircuitBreakerConfigVO.MAX_TIMEOUT) {
      throw new Error(
        `${name} must be <= ${CircuitBreakerConfigVO.MAX_TIMEOUT}ms, got ${value}ms`
      );
    }
  }

  private validateWindowSize(value: number): void {
    if (value < CircuitBreakerConfigVO.MIN_WINDOW_SIZE) {
      throw new Error(
        `slidingWindowSize must be >= ${CircuitBreakerConfigVO.MIN_WINDOW_SIZE}ms, got ${value}ms`
      );
    }
    if (value > CircuitBreakerConfigVO.MAX_WINDOW_SIZE) {
      throw new Error(
        `slidingWindowSize must be <= ${CircuitBreakerConfigVO.MAX_WINDOW_SIZE}ms, got ${value}ms`
      );
    }
  }

  private validatePositive(value: number, name: string): void {
    if (value < 1) {
      throw new Error(`${name} must be >= 1, got ${value}`);
    }
  }
}

/**
 * Алиас для краткости
 */
export const CBConfig = CircuitBreakerConfigVO;
