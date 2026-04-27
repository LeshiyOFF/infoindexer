/**
 * Circuit Breaker State Management
 *
 * Выделен в отдельный класс по SRP.
 */

import { CircuitState } from './circuit-breaker-types';
import type { CircuitBreakerConfig } from './circuit-breaker-config';
import type { CircuitStats } from './circuit-breaker-config';

/**
 * Хранилище состояния Circuit Breaker
 */
export class CircuitStateStorage {
  currentState: CircuitState = CircuitState.CLOSED;
  failureCount = 0;
  successCount = 0;
  lastFailureTime = 0;
  lastStateChange: number;
  nextAttemptTime = 0;
  readonly failures: number[] = [];

  constructor(
    private readonly config: CircuitBreakerConfig,
    public readonly now: () => number
  ) {
    this.lastStateChange = now();
  }

  /** Проверяет нужно ли переход из OPEN в HALF_OPEN */
  shouldAttemptTransition(currentTime: number): boolean {
    return this.currentState === 'open' && currentTime >= this.nextAttemptTime;
  }

  /** Обработка успешного выполнения */
  onSuccess(): void {
    this.failureCount = 0;
    this.failures.length = 0;

    if (this.currentState === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.CLOSED);
      this.successCount = 0;
    } else if (this.currentState === CircuitState.CLOSED) {
      this.successCount++;
    }
  }

  /** Обработка неудачного выполнения */
  onFailure(currentTime: number): void {
    this.failureCount++;
    this.lastFailureTime = currentTime;
    this.failures.push(currentTime);

    this.cleanOldFailures(currentTime);

    if (this.shouldOpenCircuit()) {
      this.transitionTo(CircuitState.OPEN);
      this.nextAttemptTime = currentTime + this.config.openTimeout;
    } else if (this.currentState === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
      this.nextAttemptTime = currentTime + this.config.openTimeout;
    }
  }

  /** Очищает старые записи за пределами окна */
  private cleanOldFailures(currentTime: number): void {
    const windowStart = currentTime - this.config.slidingWindowSize;
    while (this.failures.length > 0 && this.failures[0]! < windowStart) {
      this.failures.shift();
    }
  }

  /** Проверяет порог для открытия цепи */
  private shouldOpenCircuit(): boolean {
    return (
      this.currentState === CircuitState.CLOSED &&
      this.failureCount >= this.config.failureThreshold
    );
  }

  /** Переход в новое состояние */
  transitionTo(newState: CircuitState): void {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.lastStateChange = this.now();
    }
  }

  /** Сброс состояния */
  reset(): void {
    this.currentState = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.failures.length = 0;
    this.lastStateChange = this.now();
  }

  /** Статистика */
  getStats(): CircuitStats {
    return {
      state: this.currentState,
      failureCount: this.failureCount,
      successCount: this.successCount,
      failuresInWindow: this.failures.length,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange
    };
  }
}
