/**
 * Circuit Breaker — Facade для обратной совместимости
 *
 * @remarks
 * Infrastructure Layer — Facade Pattern.
 * Обёртка над CircuitBreakerAdapter для сохранения обратной совместимости.
 *
 * @deprecated Рекомендуется использовать ICircuitBreakerPort напрямую
 * через CircuitBreakerAdapter или CircuitBreakerManagerService.
 *
 * Старый API остаётся работающим для существующего кода.
 * Новый код должен использовать Port interface.
 *
 * @example
 * ```ts
 * // Old API (still works)
 * const breaker = new CircuitBreaker(config);
 * const result = await breaker.execute(fn);
 *
 * // New API (recommended)
 * const breaker = new CircuitBreakerAdapter('name', config, metrics);
 * const result = await breaker.execute(fn);
 * ```
 */
import type { CircuitBreakerConfig } from '../ports/i-circuit-breaker.port';
import type { CircuitState } from '../ports/i-circuit-breaker.port';
import type { CircuitResult } from '../ports/i-circuit-breaker.port';
import type { CircuitStats } from '../ports/i-circuit-breaker.port';
/**
 * Конфигурация Circuit Breaker (legacy)
 *
 * @remarks
 * Сохранён для обратной совместимости.
 * @deprecated Используйте CircuitBreakerConfigVO или CircuitBreakerConfig
 */
export interface LegacyCircuitBreakerConfig {
    readonly failureThreshold: number;
    readonly halfOpenTimeout: number;
    readonly openTimeout: number;
    readonly slidingWindowSize: number;
}
/**
 * Значения по умолчанию (legacy)
 *
 * @remarks
 * @deprecated Используйте CircuitBreakerConfigVO.default()
 */
export declare const DEFAULT_CIRCUIT_CONFIG: LegacyCircuitBreakerConfig;
/**
 * Circuit Breaker — Facade
 *
 * @remarks
 * Facade Pattern: предоставляет простой интерфейс к сложной подсистеме.
 * Делегирует выполнение CircuitBreakerAdapter.
 *
 * Сохраняет обратную совместимость со старым кодом.
 */
export declare class CircuitBreaker {
    private readonly adapter;
    /**
     * Создаёт Circuit Breaker
     *
     * @param config - Конфигурация (legacy или новая)
     * @param now - Функция получения времени (для тестов)
     *
     * @remarks
     * Принимает как старую так и новую конфигурацию.
     * Автоматически конвертирует в новый формат.
     */
    constructor(config?: LegacyCircuitBreakerConfig | CircuitBreakerConfig, now?: () => number);
    /**
     * Текущее состояние
     *
     * @deprecated Используйте getState()
     */
    get currentState(): CircuitState;
    /**
     * Возвращает текущее состояние
     *
     * @returns Текущее состояние circuit breaker
     */
    getState(): CircuitState;
    /**
     * Выполняет функцию с защитой Circuit Breaker
     *
     * @param fn - Функция для выполнения
     * @returns Результат выполнения
     *
     * @remarks
     * Сохраняет старую сигнатуру для совместимости.
     */
    execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>>;
    /**
     * Выполняет функцию с fallback при ошибке
     *
     * @param fn - Основная функция
     * @param fallback - Fallback функция
     * @returns Результат выполнения или fallback
     */
    executeWithFallback<T>(fn: () => Promise<T>, fallback: (error: 'circuit_open' | 'execution_failed') => Promise<T>): Promise<T>;
    /**
     * Принудительный сброс
     */
    reset(): void;
    /**
     * Проверяет, может ли запрос быть выполнен
     *
     * @returns true если запрос может быть выполнен
     */
    canProceed(): boolean;
    /**
     * Статистика для мониторинга
     *
     * @returns Статистика circuit breaker
     */
    getStats(): CircuitStats;
    /**
     * Нормализует конфигурацию в новый формат
     *
     * @param config - Старая или новая конфигурация
     * @returns Нормализованная конфигурация
     */
    private normalizeConfig;
}
export * from './circuit-breaker-types';
export * from './circuit-breaker-config';
export { CircuitStateStorage } from './circuit-breaker-state';
export { CircuitBreakerAdapter } from './adapters/circuit-breaker.adapter';
export { CircuitBreakerConfigVO } from '../domain/value-objects/circuit-breaker-config.vo';
export type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
export type { ICircuitBreakerEventsPort } from '../ports/i-circuit-breaker-events.port';
export type { CircuitBreakerManager } from '../domain/circuit-breaker-manager.service';
