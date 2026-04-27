/**
 * Port для событий Circuit Breaker (Observer Pattern)
 *
 * @remarks
 * Порт в Hexagonal Architecture для реализации Observer Pattern.
 * Позволяет подписываться на события Circuit Breaker.
 */

import type { CircuitState } from './types/circuit-breaker.types';

/**
 * Событие изменения состояния Circuit Breaker
 */
export interface StateChangeEvent {
  readonly breakerName: string;
  readonly previousState: CircuitState;
  readonly newState: CircuitState;
  readonly timestamp: number;
  readonly reason: StateChangeReason;
}

/**
 * Причина изменения состояния
 */
export type StateChangeReason =
  | 'threshold_exceeded'
  | 'timeout_elapsed'
  | 'success_threshold'
  | 'manual_reset';

/**
 * Событие неудачного выполнения
 */
export interface FailureEvent {
  readonly breakerName: string;
  readonly state: CircuitState;
  readonly error: Error;
  readonly timestamp: number;
  readonly failureCount: number;
  readonly failuresInWindow: number;
}

/**
 * Событие успешного выполнения
 */
export interface SuccessEvent {
  readonly breakerName: string;
  readonly state: CircuitState;
  readonly timestamp: number;
  readonly successCount: number;
}

/**
 * Событие сброса Circuit Breaker
 */
export interface ResetEvent {
  readonly breakerName: string;
  readonly previousState: CircuitState;
  readonly timestamp: number;
}

/**
 * Объединённый тип всех событий Circuit Breaker
 */
export type CircuitBreakerEvent =
  | StateChangeEvent
  | FailureEvent
  | SuccessEvent
  | ResetEvent;

/**
 * Port для обработки событий Circuit Breaker
 *
 * @remarks
 * Observer Pattern: обработчики подписываются на события.
 * Все методы optional — реализация выбирает что обрабатывать.
 */
export interface ICircuitBreakerEventsPort {
  /**
   * Обработка изменения состояния
   *
   * @param event - Данные события
   */
  onStateChange?(event: StateChangeEvent): void;

  /**
   * Обработка неудачного выполнения
   *
   * @param event - Данные события
   */
  onFailure?(event: FailureEvent): void;

  /**
   * Обработка успешного выполнения
   *
   * @param event - Данные события
   */
  onSuccess?(event: SuccessEvent): void;

  /**
   * Обработка сброса Circuit Breaker
   *
   * @param event - Данные события
   */
  onReset?(event: ResetEvent): void;
}
