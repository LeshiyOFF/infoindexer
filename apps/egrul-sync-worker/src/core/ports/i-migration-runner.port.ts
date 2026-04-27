/**
 * Port для выполнения миграций ClickHouse
 *
 * @remarks
 * Абстракция над миграциями базы данных.
 * Позволяет применять SQL миграции независимо от реализации.
 *
 * Следует Dependency Inversion Principle: Domain определяет контракт,
 * Infrastructure предоставляет реализацию.
 */

/**
 * Результат применения миграции
 *
 * @remarks
 * Immutable DTO с readonly свойствами.
 * Содержит информацию о результате выполнения миграции.
 */
export interface MigrationResult {
  /** true если миграция применена успешно */
  readonly success: boolean;
  /** Версия миграции */
  readonly version: string;
  /** Время выполнения в миллисекундах */
  readonly durationMs: number;
  /** Текст ошибки (если была) */
  readonly error?: string;
}

/**
 * Опции для выполнения миграции
 *
 * @remarks
 * Immutable конфигурация для выполнения миграции.
 */
export interface MigrationOptions {
  /** Версия миграции (например, "001") */
  readonly version: string;
  /** Человеческое описание миграции */
  readonly description: string;
  /** Если true — только логирование без применения */
  readonly dryRun?: boolean;
}

/**
 * Port для выполнения миграций
 *
 * @remarks
 * Определяет контракт для применения миграций базы данных.
 * Позволяет применять SQL миграции независимо от СУБД.
 *
 * @example
 * ```typescript
 * const runner: IMigrationRunner = createMigrationRunner(client);
 * const result = await runner.apply(sql, {
 *   version: '001',
 *   description: 'Create resume_states table'
 * });
 *
 * if (result.success) {
 *   console.log(`Applied in ${result.durationMs}ms`);
 * }
 * ```
 */
export interface IMigrationRunner {
  /**
   * Применяет SQL миграцию
   *
   * @param sql - SQL скрипт миграции
   * @param options - Опции миграции
   * @returns Результат применения
   */
  apply(sql: string, options: MigrationOptions): Promise<MigrationResult>;

  /**
   * Проверяет была ли уже применена миграция
   *
   * @param version - Версия миграции
   * @returns true если миграция уже применена
   */
  isApplied(version: string): Promise<boolean>;
}
