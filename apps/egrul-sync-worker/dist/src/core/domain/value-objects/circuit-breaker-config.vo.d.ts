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
    withFailureThreshold(value: number): CircuitBreakerConfigVO;
    withOpenTimeout(value: number): CircuitBreakerConfigVO;
    withHalfOpenTimeout(value: number): CircuitBreakerConfigVO;
    withSlidingWindowSize(value: number): CircuitBreakerConfigVO;
    toConfig(): CircuitBreakerConfig;
    private validateFailureThreshold;
    private validateTimeout;
    private validateWindowSize;
    private validatePositive;
}
/**
 * Алиас для краткости
 */
export declare const CBConfig: typeof CircuitBreakerConfigVO;
