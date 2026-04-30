/**
 * Port: IHealthCheck
 *
 * @remarks
 * Interface for system health check operations.
 * Follows Interface Segregation: focused, single-purpose interface.
 * Reuses existing types from domain/types/health.types to avoid duplication.
 *
 * @pattern Hexagonal / Ports & Adapters
 * @pattern Dependency Inversion Principle
 * @pattern Interface Segregation Principle
 * @pattern DRY (Don't Repeat Yourself)
 */
import type { HealthStatus, ComponentHealth } from '../types/health.types';

/**
 * Результат проверки здоровья системы
 *
 * @remarks
 * Агрегированный результат health check всех компонентов.
 * Immutable (readonly) для предотвращения мутаций.
 */
export interface SystemHealthResult {
  /** Общий статус системы */
  readonly status: HealthStatus;
  /** Результаты по каждому компоненту */
  readonly components: readonly ComponentHealth[];
  /** Время проверки */
  readonly checkedAt: Date;
}

/**
 * Port для проверки здоровья системы
 *
 * @remarks
 * Определяет контракт для health check операций.
 * Следует Interface Segregation: только необходимые методы.
 *
 * Используется для проверки состояния критических компонентов:
 * - ClickHouse
 * - Redis
 * - Transform Service
 */
export interface IHealthCheck {
  /**
   * Проверить здоровье всех компонентов
   *
   * @remarks
   * Выполняет проверку всех зарегистрированных компонентов.
   * Возвращает агрегированный результат с общим статусом.
   *
   * @returns Агрегированный результат health check
   */
  check(): Promise<SystemHealthResult>;

  /**
   * Проверить здоровье конкретного компонента
   *
   * @remarks
   * Выполняет проверку только указанного компонента.
   *
   * @param name - Имя компонента
   * @returns Результат health check компонента
   */
  checkComponent(name: string): Promise<ComponentHealth>;

  /**
   * Зарегистрировать компонент для проверки
   *
   * @remarks
   * Добавляет компонент в список проверяемых.
   *
   * @param name - Уникальное имя компонента
   * @param checker - Функция проверки компонента
   */
  register(name: string, checker: () => Promise<ComponentHealth>): void;
}
