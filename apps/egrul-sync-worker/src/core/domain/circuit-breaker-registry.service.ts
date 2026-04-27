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
export class CircuitBreakerRegistry {
  private readonly breakers: Map<string, ICircuitBreakerPort>;
  private readonly factories: Map<string, CircuitBreakerFactory>;

  constructor() {
    this.breakers = new Map();
    this.factories = new Map();
  }

  /**
   * Регистрирует factory для circuit breaker
   *
   * @param name - Имя circuit breaker
   * @param factory - Factory function
   *
   * @remarks
   * Factory вызывается при первом обращении к breaker.
   */
  registerFactory(name: string, factory: CircuitBreakerFactory): void {
    if (this.breakers.has(name) || this.factories.has(name)) {
      throw new Error(`Circuit breaker '${name}' already exists`);
    }
    this.factories.set(name, factory);
  }

  /**
   * Регистрирует готовый circuit breaker
   *
   * @param name - Имя circuit breaker
   * @param breaker - Экземпляр circuit breaker
   */
  register(name: string, breaker: ICircuitBreakerPort): void {
    if (this.breakers.has(name)) {
      throw new Error(`Circuit breaker '${name}' already exists`);
    }
    this.breakers.set(name, breaker);
  }

  /**
   * Получает circuit breaker по имени
   *
   * @param name - Имя circuit breaker
   * @returns Экземпляр или undefined
   */
  get(name: string): ICircuitBreakerPort | undefined {
    return this.breakers.get(name);
  }

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
  getOrCreate(name: string): ICircuitBreakerPort {
    const existing = this.breakers.get(name);
    if (existing) {
      return existing;
    }

    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`No circuit breaker or factory for '${name}'`);
    }

    const breaker = factory(name);
    this.breakers.set(name, breaker);
    this.factories.delete(name);
    return breaker;
  }

  /**
   * Проверяет существование circuit breaker
   *
   * @param name - Имя circuit breaker
   * @returns true если существует
   */
  has(name: string): boolean {
    return this.breakers.has(name) || this.factories.has(name);
  }

  /**
   * Возвращает все имена зарегистрированных breaker
   *
   * @returns Массив имён
   */
  names(): string[] {
    const result = new Set<string>();
    this.breakers.forEach((_, name) => result.add(name));
    this.factories.forEach((_, name) => result.add(name));
    return Array.from(result);
  }

  /**
   * Удаляет circuit breaker из registry
   *
   * @param name - Имя circuit breaker
   * @returns true если breaker был найден и удалён
   */
  delete(name: string): boolean {
    const hadFactory = this.factories.has(name);
    this.factories.delete(name);
    const hadBreaker = this.breakers.delete(name);
    return hadFactory || hadBreaker;
  }

  /**
   * Очищает все circuit breaker
   *
   * @remarks
   * Удаляет все breaker и factories.
   */
  clear(): void {
    this.breakers.clear();
    this.factories.clear();
  }

  /**
   * Возвращает количество зарегистрированных breaker
   *
   * @returns Количество breaker
   */
  get size(): number {
    return this.breakers.size + this.factories.size;
  }

  /**
   * Возвращает всех зарегистрированных breaker
   *
   * @returns Map имя → circuit breaker
   */
  getAllBreakers(): Map<string, ICircuitBreakerPort> {
    return new Map(this.breakers);
  }

  /**
   * Сбрасывает все circuit breaker в CLOSED
   *
   * @remarks
   * Используется для ручного восстановления.
   */
  resetAll(): void {
    this.breakers.forEach((breaker) => breaker.reset());
  }

  /**
   * Сбрасывает конкретный circuit breaker
   *
   * @param name - Имя circuit breaker
   * @returns true если breaker был найден и сброшен
   */
  reset(name: string): boolean {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.reset();
      return true;
    }
    return false;
  }
}
