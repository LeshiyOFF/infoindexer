/**
 * Circuit Breaker Manager — Facade для управления CB
 *
 * @remarks
 * Domain Layer — Service в Hexagonal Architecture.
 * Facade Pattern: единая точка входа для всех CB операций.
 * Делегирует работу CircuitBreakerRegistry и CircuitBreakerHealthChecker.
 *
 * Следует SRP: ответственен только за координацию.
 * Следует Facade Pattern: скрывает сложность работы с реестром.
 */

import type { CircuitResult } from '../ports/i-circuit-breaker.port';
import { CircuitState } from '../ports/i-circuit-breaker.port';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import type { CircuitBreakerHealth } from './types/circuit-breaker-health.types';
import type { ICircuitBreakerManagerPort } from '../ports/i-circuit-breaker-manager.port';
import { CircuitBreakerRegistry } from './circuit-breaker-registry.service';
import { CircuitBreakerHealthChecker } from './circuit-breaker-health.service';

/**
 * Facade для управления Circuit Breaker
 *
 * @remarks
 * Реализует ICircuitBreakerManagerPort.
 * Делегирует работу CircuitBreakerRegistry и CircuitBreakerHealthChecker.
 */
export class CircuitBreakerManager implements ICircuitBreakerManagerPort {
  private readonly registry: CircuitBreakerRegistry;
  private readonly healthChecker: CircuitBreakerHealthChecker;

  constructor() {
    this.registry = new CircuitBreakerRegistry();
    this.healthChecker = new CircuitBreakerHealthChecker(
      () => this.registry.getAllBreakers()
    );
  }

  registerFactory(breakerName: string, factory: () => ICircuitBreakerPort): void {
    this.registry.registerFactory(breakerName, factory);
  }

  register(name: string, breaker: ICircuitBreakerPort): void {
    this.registry.register(name, breaker);
  }

  has(breakerName: string): boolean {
    return this.registry.has(breakerName);
  }

  names(): string[] {
    return this.registry.names();
  }

  private getOrCreateBreaker(breakerName: string): ICircuitBreakerPort {
    return this.registry.getOrCreate(breakerName);
  }

  getHealth(): CircuitBreakerHealth {
    return this.healthChecker.getHealth();
  }

  resetAll(): void {
    this.registry.resetAll();
  }

  reset(breakerName: string): boolean {
    return this.registry.reset(breakerName);
  }

  isAllClosed(): boolean {
    return this.healthChecker.isAllClosed();
  }

  getOpenBreakers(): string[] {
    return this.healthChecker.getOpenBreakers();
  }

  async execute<T>(
    breakerName: string,
    fn: () => Promise<T>
  ): Promise<CircuitResult<T>> {
    const breaker = this.getOrCreateBreaker(breakerName);
    return breaker.execute(fn);
  }

  async executeWithFallback<T>(
    breakerName: string,
    fn: () => Promise<T>,
    fallback: (error: Error) => Promise<T>
  ): Promise<T> {
    const breaker = this.getOrCreateBreaker(breakerName);

    // CircuitError в адаптере это string, конвертируем в Error
    return breaker.executeWithFallback(fn, async (circuitError) => {
      const error = new Error(typeof circuitError === 'string' ? circuitError : String(circuitError));
      return fallback(error);
    });
  }

  getState(breakerName: string): CircuitState {
    const breaker = this.registry.get(breakerName);
    return breaker?.getState() ?? CircuitState.CLOSED;
  }
}
