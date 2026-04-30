/**
 * Registry для Circuit Breaker
 *
 * @remarks
 * Domain Layer — Registry Pattern в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за хранение и получение circuit breaker.
 *
 * Следует SRP: ответственен только за registry.
 */
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import type { CircuitBreakerFactory } from './types/circuit-breaker-health.types';
/**
 * Registry для Circuit Breaker
 *
 * @remarks
 * Registry Pattern: хранит ссылки на все circuit breaker.
 * Позволяет ленивое создание через factory.
 */
export declare class CircuitBreakerRegistry {
    private readonly breakers;
    private readonly factories;
    constructor();
    /**
     * Регистрирует factory для circuit breaker
     *
     * @param name - Имя circuit breaker
     * @param factory - Factory function
     *
     * @remarks
     * Factory вызывается при первом обращении к breaker.
     */
    registerFactory(name: string, factory: CircuitBreakerFactory): void;
    /**
     * Регистрирует готовый circuit breaker
     *
     * @param name - Имя circuit breaker
     * @param breaker - Экземпляр circuit breaker
     */
    register(name: string, breaker: ICircuitBreakerPort): void;
    /**
     * Получает circuit breaker по имени
     *
     * @param name - Имя circuit breaker
     * @returns Экземпляр или undefined
     */
    get(name: string): ICircuitBreakerPort | undefined;
    /**
     * Получает или создаёт circuit breaker
     *
     * @param name - Имя circuit breaker
     * @returns Экземпляр circuit breaker
     * @throws {Error} Если нет factory и breaker не существует
     *
     * @remarks
     * Ленивое создание: если breaker не существует,
     * вызывает зарегистрированный factory.
     */
    getOrCreate(name: string): ICircuitBreakerPort;
    /**
     * Проверяет существование circuit breaker
     *
     * @param name - Имя circuit breaker
     * @returns true если существует
     */
    has(name: string): boolean;
    /**
     * Возвращает все имена зарегистрированных breaker
     *
     * @returns Массив имён
     */
    names(): string[];
    /**
     * Удаляет circuit breaker из registry
     *
     * @param name - Имя circuit breaker
     * @returns true если breaker был найден и удалён
     */
    delete(name: string): boolean;
    /**
     * Очищает все circuit breaker
     *
     * @remarks
     * Удаляет все breaker и factories.
     */
    clear(): void;
    /**
     * Возвращает количество зарегистрированных breaker
     *
     * @returns Количество breaker
     */
    get size(): number;
    /**
     * Возвращает всех зарегистрированных breaker
     *
     * @returns Map имя → circuit breaker
     */
    getAllBreakers(): Map<string, ICircuitBreakerPort>;
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
     * @param name - Имя circuit breaker
     * @returns true если breaker был найден и сброшен
     */
    reset(name: string): boolean;
}
