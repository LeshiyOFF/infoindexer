/**
 * Типы для Circuit Breaker Manager
 *
 * @remarks
 * Domain Layer — Types в Hexagonal Architecture.
 * Содержит типы для управления множеством circuit breaker.
 *
 * Следует SRP: ответственен только за типы данных.
 */

import type { CircuitStats } from '../../ports/types/circuit-breaker.types';

/**
 * Health status всех circuit breaker
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Агрегирует состояние всех CB для health check.
 */
export interface CircuitBreakerHealth {
  /** Общее количество circuit breaker */
  readonly total: number;

  /** Количество в CLOSED состоянии */
  readonly closed: number;

  /** Количество в OPEN состоянии */
  readonly open: number;

  /** Количество в HALF_OPEN состоянии */
  readonly halfOpen: number;

  /** Детальная статистика по имени */
  readonly details: ReadonlyMap<string, CircuitStats>;
}

/**
 * Результат выполнения через именованный circuit breaker
 *
 * @remarks
 * Включает имя CB для идентификации.
 */
export interface NamedCircuitResult<T> {
  readonly breakerName: string;
  readonly result: 'executed' | 'blocked';
  readonly value?: T;
  readonly error?: string;
}

/**
 * Factory function для создания circuit breaker
 *
 * @remarks
 * Используется для ленивого создания CB.
 */
export type CircuitBreakerFactory = (name: string) => import('../../ports/i-circuit-breaker.port').ICircuitBreakerPort;
