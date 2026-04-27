/**
 * Circuit Breaker Configuration Value Object
 *
 * @remarks
 * Immutable конфигурация для Circuit Breaker.
 * Следует SRP: только хранение и валидация параметров.
 * Следует Value Object pattern: нет идентичности, равенство по значениям.
 * Следует OCP: factory методы для создания конфигураций.
 *
 * Значения по умолчанию основаны на рекомендациях Netflix Hystrix:
 * - failureThreshold: 5 отказов перед открытием
 * - successThreshold: 2 успеха для закрытия из half-open
 * - timeoutMs: 60000мс (1 минута) перед попыткой восстановления
 * - halfOpenAttempts: 3 попыток в состоянии half-open
 */
export declare class CircuitBreakerConfig {
    private static readonly DEFAULT_FAILURE_THRESHOLD;
    private static readonly DEFAULT_SUCCESS_THRESHOLD;
    private static readonly DEFAULT_TIMEOUT_MS;
    private static readonly DEFAULT_HALF_OPEN_ATTEMPTS;
    private static readonly MIN_FAILURE_THRESHOLD;
    private static readonly MAX_FAILURE_THRESHOLD;
    readonly failureThreshold: number;
    readonly successThreshold: number;
    readonly timeoutMs: number;
    readonly halfOpenAttempts: number;
    constructor(failureThreshold?: number, successThreshold?: number, timeoutMs?: number, halfOpenAttempts?: number);
    /**
     * Создать конфигурацию с кастомным порогом отказов
     */
    static withFailureThreshold(threshold: number): CircuitBreakerConfig;
    /**
     * Создать конфигурацию для тестирования (быстрое восстановление)
     */
    static forTesting(): CircuitBreakerConfig;
    private validateFailureThreshold;
    private validateSuccessThreshold;
    private validateTimeout;
    private validateHalfOpenAttempts;
}
