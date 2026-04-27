/**
 * Null Object Pattern для Circuit Breaker
 *
 * @remarks
 * Infrastructure Layer — Adapter в Hexagonal Architecture.
 * Реализует ICircuitBreakerPort с zero overhead.
 *
 * Всегда в CLOSED состоянии, все запросы выполняются напрямую.
 * Используется когда circuit breaker отключён конфигурацией.
 *
 * Следует Null Object Pattern: no-op реализация интерфейса.
 * Следует SRP: ответственен только за делегирование.
 *
 * @example
 * ```ts
 * const breaker = ENABLE_CIRCUIT_BREAKER
 *   ? new CircuitBreakerAdapter(name, config, metrics)
 *   : new NullCircuitBreakerAdapter();
 * ```
 */
import type { CircuitResult, CircuitStats, CircuitError } from '../../ports/i-circuit-breaker.port';
import type { ICircuitBreakerPort } from '../../ports/i-circuit-breaker.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';
/**
 * Null Object для Circuit Breaker
 *
 * @remarks
 * Всегда выполняет функцию, никогда не блокирует.
 * Zero overhead: никаких проверок, никакого состояния.
 *
 * Используется когда:
 * - Circuit breaker отключён globally
 * - Для определённых сервисов где CB не нужен
 * - В тестах для mocking
 */
export declare class NullCircuitBreakerAdapter implements ICircuitBreakerPort {
    readonly breakerName: string;
    constructor(breakerName?: string);
    /**
     * Выполняет функцию напрямую без защиты
     *
     * @param fn - Функция для выполнения
     * @returns Результат выполнения
     *
     * @remarks
     * Никогда не блокирует, всегда выполняет fn.
     * При ошибке пробрасывает exception.
     */
    execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>>;
    /**
     * Выполняет функцию с fallback
     *
     * @param fn - Основная функция
     * @param fallback - Fallback функция
     * @returns Результат выполнения или fallback
     *
     * @remarks
     * Сначала пытается выполнить fn, при ошибке вызывает fallback.
     */
    executeWithFallback<T>(fn: () => Promise<T>, fallback: (error: CircuitError) => Promise<T>): Promise<T>;
    /**
     * Всегда возвращает CLOSED
     *
     * @returns CircuitState.CLOSED
     */
    getState(): CircuitState;
    /**
     * Возвращает пустую статистику
     *
     * @returns Статистика с нулевыми значениями
     */
    getStats(): CircuitStats;
    /**
     * Ничего не делает (no-op)
     *
     * @remarks
     * Null Object pattern: метод существует но ничего не делает.
     */
    reset(): void;
    /**
     * Всегда возвращает true
     *
     * @returns true
     *
     * @remarks
     * Никогда не блокирует выполнение.
     */
    canProceed(): boolean;
}
/**
 * Синглтон экземпляр для переиспользования
 *
 * @remarks
 * Можно использовать один экземпляр везде,
 * так как состояние не изменяется.
 */
export declare const NULL_CIRCUIT_BREAKER: NullCircuitBreakerAdapter;
