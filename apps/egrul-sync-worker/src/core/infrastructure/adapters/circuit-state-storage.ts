/**
 * Хранилище состояния Circuit Breaker
 *
 * @remarks
 * Infrastructure Layer — State Storage в Hexagonal Architecture.
 * Выделено в отдельный класс для SRP.
 * Хранит изменяемое состояние, изолированное от адаптера.
 *
 * Следует SRP: ответственен только за хранение и изменение состояния.
 * Следует State Machine Pattern: CLOSED → OPEN → HALF_OPEN → CLOSED.
 */

import type { CircuitBreakerConfig } from '../../ports/i-circuit-breaker.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';
import type { StateChangeReason } from '../../ports/i-circuit-breaker-events.port';

/**
 * Результат изменения состояния
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Возвращается при изменении состояния circuit breaker.
 */
export interface StateTransitionResult {
  /** Произошло ли изменение состояния */
  readonly transition: boolean;

  /** Новое состояние (если было изменение) */
  readonly to?: CircuitState;

  /** Причина изменения */
  readonly reason?: StateChangeReason;
}

/**
 * Внутреннее хранилище состояния Circuit Breaker
 *
 * @remarks
 * Thread-safety: не гарантируется для конкурентного доступа.
 * Использует sliding window для отслеживания неудач.
 */
export class CircuitStateStorage {
  /** Текущее состояние */
  currentState: CircuitState;

  /** Количество неудач в текущем окне */
  failureCount = 0;

  /** Количество успешных запросов подряд */
  successCount = 0;

  /** Время последней неудачи (timestamp) */
  lastFailureTime = 0;

  /** Время последнего изменения состояния (timestamp) */
  readonly lastStateChange: number;

  /** Время следующей попытки (timestamp) */
  nextAttemptTime = 0;

  /** Количество вызов в HALF_OPEN состоянии */
  halfOpenCalls = 0;

  /** Скользящее окно неудач (timestamps) */
  readonly failures: number[] = [];

  constructor(
    private readonly config: CircuitBreakerConfig,
    private readonly now: () => number
  ) {
    this.currentState = CircuitState.CLOSED;
    this.lastStateChange = now();
  }

  /**
   * Проверяет, можно ли попытаться изменить состояние
   *
   * @param currentTime - Текущее время
   * @returns true если можно попытаться
   *
   * @remarks
   * В OPEN состоянии проверяет timeout.
   */
  shouldAttemptTransition(currentTime: number): boolean {
    return this.currentState === CircuitState.OPEN && currentTime >= this.nextAttemptTime;
  }

  /**
   * Записывает успешное выполнение
   *
   * @returns Результат изменения состояния
   *
   * @remarks
   * В HALF_OPEN: после successThreshold успешных запросов → CLOSED
   * В CLOSED: просто увеличивает счётчик успехов
   */
  recordSuccess(): StateTransitionResult {
    this.failureCount = 0;
    this.failures.length = 0;

    if (this.currentState === CircuitState.HALF_OPEN) {
      this.halfOpenCalls++;
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls ||
          this.successCount + 1 >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        this.successCount = 0;
        return { transition: true, to: CircuitState.CLOSED, reason: 'success_threshold' as StateChangeReason };
      }
    } else if (this.currentState === CircuitState.CLOSED) {
      this.successCount++;
    }
    return { transition: false };
  }

  /**
   * Записывает неудачное выполнение
   *
   * @param currentTime - Текущее время
   * @returns Результат изменения состояния
   *
   * @remarks
   * В CLOSED: после failureThreshold неудач → OPEN
   * В HALF_OPEN: любая неудача → OPEN
   */
  recordFailure(currentTime: number): StateTransitionResult {
    this.failureCount++;
    this.lastFailureTime = currentTime;
    this.failures.push(currentTime);

    this.cleanOldFailures(currentTime);

    if (this.currentState === CircuitState.CLOSED && this.shouldOpenCircuit()) {
      this.transitionTo(CircuitState.OPEN);
      this.nextAttemptTime = currentTime + this.config.openTimeout;
      return { transition: true, to: CircuitState.OPEN, reason: 'threshold_exceeded' as StateChangeReason };
    } else if (this.currentState === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
      this.nextAttemptTime = currentTime + this.config.openTimeout;
      return { transition: true, to: CircuitState.OPEN, reason: 'threshold_exceeded' as StateChangeReason };
    }
    return { transition: false };
  }

  /**
   * Переходит в новое состояние
   *
   * @param newState - Новое состояние
   *
   * @remarks
   * Обновляет lastStateChange при изменении.
   */
  transitionTo(newState: CircuitState): void {
    if (this.currentState !== newState) {
      this.currentState = newState;
      (this.lastStateChange as number) = this.now();
    }
  }

  /**
   * Сбрасывает состояние в начальное
   *
   * @remarks
   * Используется для ручного восстановления.
   */
  reset(): void {
    this.currentState = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    this.failures.length = 0;
    (this.lastStateChange as number) = this.now();
  }

  /**
   * Удаляет устаревшие записи о неудачах
   *
   * @param currentTime - Текущее время
   *
   * @remarks
   * Удаляет записи старше slidingWindowSize.
   */
  private cleanOldFailures(currentTime: number): void {
    const windowStart = currentTime - this.config.slidingWindowSize;
    while (this.failures.length > 0 && this.failures[0]! < windowStart) {
      this.failures.shift();
    }
  }

  /**
   * Проверяет, нужно ли открыть цепь
   *
   * @returns true если нужно открыть
   *
   * @remarks
   * Проверяет порог неудач.
   */
  private shouldOpenCircuit(): boolean {
    return this.failureCount >= this.config.failureThreshold;
  }

  /**
   * Возвращает статистику для мониторинга
   *
   * @returns Статистика circuit breaker
   */
  getStats(): import('../../ports/i-circuit-breaker.port').CircuitStats {
    return {
      state: this.currentState,
      failureCount: this.failureCount,
      successCount: this.successCount,
      failuresInWindow: this.failures.length,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
      nextAttemptTime: this.nextAttemptTime
    };
  }
}
