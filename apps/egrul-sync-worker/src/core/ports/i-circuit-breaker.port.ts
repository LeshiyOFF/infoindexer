/**
 * Port для Circuit Breaker — защита от каскадных сбоев
 *
 * @remarks
 * Порт в Hexagonal Architecture.
 * Абстрагирует логику circuit breaker: предотвращение каскадных сбоев
 * при вызове внешних зависимостей.
 *
 * Следует Dependency Inversion: Domain → Interface ← Infrastructure.
 * Следует Interface Segregation: фокусированные методы.
 *
 * @see {@link https://martinfowler.com/bliki/CircuitBreaker.html | Martin Fowler on Circuit Breaker}
 *
 * @example
 * ```ts
 * class DatabaseService {
 *   constructor(private readonly breaker: ICircuitBreakerPort) {}
 *
 *   async query<T>(sql: string): Promise<T> {
 *     return this.breaker.execute(async () => {
 *       return await this.db.query(sql);
 *     });
 *   }
 * }
 * ```
 */

export {
  CircuitState
} from './types/circuit-breaker.types';

export type {
  CircuitError,
  CircuitResult,
  CircuitStats,
  CircuitBreakerConfig
} from './types/circuit-breaker.types';

/**
 * Port для Circuit Breaker
 *
 * @remarks
 * Определяет контракт защиты от каскадных сбоев.
 * Основной метод: execute() — выполняет функцию с защитой.
 *
 * Thread-safety: реализации должны быть thread-safe для
 * использования в асинхронном окружении.
 */
export interface ICircuitBreakerPort {
  /**
   * Выполняет операцию с защитой Circuit Breaker
   *
   * @param fn - Функция для выполнения
   * @returns Результат выполнения или ошибка
   *
   * @remarks
   * Поведение зависит от текущего состояния:
   * - CLOSED: выполняет fn, записывает результат
   * - OPEN: возвращает circuit_open без выполнения
   * - HALF_OPEN: выполняет fn для проверки восстановления
   *
   * При ошибке увеличивает счётчик неудач.
   * При успехе сбрасывает счётчик.
   */
  execute<T>(fn: () => Promise<T>): Promise<import('./types/circuit-breaker.types').CircuitResult<T>>;

  /**
   * Выполняет операцию с fallback при ошибке
   *
   * @param fn - Основная функция
   * @param fallback - Fallback функция
   * @returns Результат выполнения или fallback
   *
   * @remarks
   * Fallback вызывается при:
   * - circuit_open: цепь разомкнута
   * - execution_failed: функция вернула ошибку
   *
   * Позволяет реализовать graceful degradation.
   *
   * @example
   * ```ts
   * const result = await breaker.executeWithFallback(
   *   () => fetchFromPrimary(),
   *   () => fetchFromCache()
   * );
   * ```
   */
  executeWithFallback<T>(
    fn: () => Promise<T>,
    fallback: (error: import('./types/circuit-breaker.types').CircuitError) => Promise<T>
  ): Promise<T>;

  /**
   * Возвращает текущее состояние
   *
   * @returns Текущее состояние circuit breaker
   */
  getState(): import('./types/circuit-breaker.types').CircuitState;

  /**
   * Возвращает статистику для мониторинга
   *
   * @returns Статистика circuit breaker
   */
  getStats(): import('./types/circuit-breaker.types').CircuitStats;

  /**
   * Принудительно сбрасывает в CLOSED состояние
   *
   * @remarks
   * Используется для ручного восстановления после
   * исправления проблем с зависимостью.
   */
  reset(): void;

  /**
   * Проверяет, может ли запрос быть выполнен
   *
   * @returns true если запрос может быть выполнен
   *
   * @remarks
   * Возвращает false в OPEN состоянии.
   * Используется для предварительной проверки.
   */
  canProceed(): boolean;
}
