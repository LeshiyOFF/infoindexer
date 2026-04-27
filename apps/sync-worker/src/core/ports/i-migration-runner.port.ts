/**
 * Port для выполнения миграций ClickHouse
 *
 * @remarks
 * Абстракция над миграциями базы данных.
 * Позволяет применять SQL миграции независимо от реализации.
 */

/**
 * Результат применения миграции
 */
export interface MigrationResult {
  readonly success: boolean;
  readonly version: string;
  readonly durationMs: number;
  readonly error?: string;
}

/**
 * Опции для выполнения миграции
 */
export interface MigrationOptions {
  readonly version: string;
  readonly description: string;
  readonly dryRun?: boolean;
}

/**
 * Port для выполнения миграций
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
