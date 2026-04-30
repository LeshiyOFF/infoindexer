/**
 * Port для Circuit Breaker Manager
 *
 * @remarks
 * Порт в Hexagonal Architecture.
 * Facade для управления множеством circuit breaker.
 * Обеспечивает единую точку входа для операций с защитой.
 *
 * Следует Interface Segregation: фокусированные методы.
 * Следует Dependency Inversion: Domain → Interface ← Infrastructure.
 */
import type { CircuitState } from './i-circuit-breaker.port';
import type { CircuitBreakerHealth } from '../domain/types/circuit-breaker-health.types';
import type { CircuitResult } from './i-circuit-breaker.port';
/**
 * Port для Circuit Breaker Manager
 *
 * @remarks
 * Facade Pattern: единая точка входа для всех CB операций.
 * Скрывает сложность работы с Registry + HealthChecker.
 */
export interface ICircuitBreakerManagerPort {
    /**
     * Выполняет операцию с защитой circuit breaker
     *
     * @param breakerName - Имя circuit breaker
     * @param fn - Функция для выполнения
     * @returns Результат выполнения
     *
     * @throws Error если circuit open
     *
     * @remarks
     * Ленивое создание: breaker создаётся при первом обращении.
     */
    execute<T>(breakerName: string, fn: () => Promise<T>): Promise<CircuitResult<T>>;
    /**
     * Выполняет операцию с fallback при ошибке
     *
     * @param breakerName - Имя circuit breaker
     * @param fn - Основная функция
     * @param fallback - Fallback функция
     * @returns Результат выполнения или fallback
     *
     * @remarks
     * Fallback вызывается при circuit open или execution error.
     */
    executeWithFallback<T>(breakerName: string, fn: () => Promise<T>, fallback: (error: Error) => Promise<T>): Promise<T>;
    /**
     * Возвращает текущее состояние circuit breaker
     *
     * @param breakerName - Имя circuit breaker
     * @returns Текущее состояние
     */
    getState(breakerName: string): CircuitState;
    /**
     * Возвращает агрегированный health статус
     *
     * @returns Health статус всех breaker
     *
     * @remarks
     * Включает количество breaker в каждом состоянии
     * и детальную статистику по имени.
     */
    getHealth(): CircuitBreakerHealth;
    /**
     * Проверяет все ли breaker в CLOSED состоянии
     *
     * @returns true если все breaker закрыты
     */
    isAllClosed(): boolean;
    /**
     * Возвращает имена breaker в OPEN состоянии
     *
     * @returns Массив имён
     */
    getOpenBreakers(): string[];
    /**
     * Сбрасывает все circuit breaker в CLOSED
     *
     * @remarks
     * Используется для ручного восстановления.
     */
    resetAll(): void;
    /**
     * Сбрасывает конкретный circuit breaker
     *
     * @param breakerName - Имя circuit breaker
     * @returns true если breaker был найден и сброшен
     */
    reset(breakerName: string): boolean;
    /**
     * Проверяет существование circuit breaker
     *
     * @param breakerName - Имя circuit breaker
     * @returns true если существует
     */
    has(breakerName: string): boolean;
    /**
     * Возвращает все имена зарегистрированных breaker
     *
     * @returns Массив имён
     */
    names(): string[];
    /**
     * Регистрирует factory для lazy создания breaker
     *
     * @param breakerName - Имя circuit breaker
     * @param factory - Factory функция
     *
     * @remarks
     * Factory вызывается при первом обращении к breaker.
     */
    registerFactory(breakerName: string, factory: () => import('./i-circuit-breaker.port').ICircuitBreakerPort): void;
}
