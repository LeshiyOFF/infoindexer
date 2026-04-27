/**
 * Migration Orchestrator Port
 *
 * @remarks
 * Domain Layer: определяет контракт для оркестрации миграций.
 * Infrastructure Layer реализует через ClickHouse.
 *
 * Следует DIP: Domain зависит от этого порта (абстракции),
 * а не от конкретной реализации.
 *
 * Следует ISP: Интерфейс сегрегирован, содержит только
 * необходимые методы для оркестрации.
 */

/**
 * Статистика выполнения миграций
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Возвращается после применения всех миграций.
 */
export interface MigrationOrchestrationStats {
  /** Общее количество миграций */
  readonly totalMigrations: number;

  /** Количество применённых миграций */
  readonly appliedMigrations: number;

  /** Количество пропущенных (уже применённых) */
  readonly skippedMigrations: number;

  /** Количество неудачных миграций */
  readonly failedMigrations: number;

  /** Общее время выполнения в мс */
  readonly durationMs: number;
}

/**
 * Порт для оркестрации миграций
 *
 * @remarks
 * Определяет контракт для применения всех миграций
 * с distributed lock и fault tolerance.
 */
export interface IMigrationOrchestrator {
  /**
   * Применяет все миграции с distributed lock
   *
   * @returns Статистика выполнения
   * @throws {Error} если миграция не удалась
   *
   * @remarks
   * - Приобретает distributed lock
   * - Применяет миграции по порядку
   * - Пропускает уже применённые
   * - Собирает статистику
   */
  orchestrate(): Promise<MigrationOrchestrationStats>;

  /**
   * Получает текущий статус миграций
   *
   * @returns Статистика текущего состояния
   *
   * @remarks
   * Не применяет миграции, только возвращает статус.
   */
  getStatus(): Promise<MigrationOrchestrationStats>;
}
