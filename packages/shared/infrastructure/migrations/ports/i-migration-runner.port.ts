import type { MigrationCategory } from '../domain/value-objects/migration-descriptor.vo';

/**
 * Migration Runner Port
 *
 * @remarks
 * Domain Layer: определяет контракт для выполнения SQL миграций.
 * Infrastructure Layer реализует через ClickHouse.
 *
 * Следует DIP: Domain зависит от этого порта (абстракции),
 * а не от конкретной реализации.
 */

/**
 * Результат применения миграции
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Возвращается после применения одной миграции.
 */
export interface MigrationResult {
  /** Успешность применения */
  readonly success: boolean;

  /** Версия миграции */
  readonly version: string;

  /** Время выполнения в мс */
  readonly durationMs: number;

  /** Ошибка (если не удалось) */
  readonly error?: string;

  /** Время применения */
  readonly appliedAt?: Date;
}

/**
 * Опции для выполнения миграции
 *
 * @remarks
 * Value Object с readonly свойствами.
 */
export interface MigrationOptions {
  /** Категория миграции (shared, sync-worker, egrul-sync-worker) */
  readonly category: MigrationCategory;

  /** Версия миграции */
  readonly version: string;

  /** Описание миграции */
  readonly description: string;

  /** Dry run (только логирование, без применения) */
  readonly dryRun?: boolean;
}

/**
 * Порт для выполнения миграций
 *
 * @remarks
 * Определяет контракт для применения SQL миграций
 * с отслеживанием применённых версий по (category, version).
 */
export interface IMigrationRunner {
  /**
   * Применяет SQL миграцию
   *
   * @param sql - SQL скрипт миграции
   * @param options - Опции миграции
   * @returns Результат применения
   *
   * @remarks
   * - Проверяет что миграция ещё не применена
   * - Выполняет SQL
   * - Регистрирует миграцию как применённую
   */
  apply(sql: string, options: MigrationOptions): Promise<MigrationResult>;

  /**
   * Проверяет была ли уже применена миграция
   *
   * @param category - Категория миграции
   * @param version - Версия миграции
   * @returns true если миграция уже применена
   */
  isApplied(category: string, version: string): Promise<boolean>;

  /**
   * Полностью очищает базу данных (только для dev/testing)
   *
   * @returns Promise<void>
   *
   * @remarks
   * ⚠️ DANGEROUS: Удаляет ВСЕ данные без возможности восстановления!
   *
   * Используется только когда MIGRATION_AUTO_CLEANUP=true.
   * НИКОГДА не использовать в production.
   *
   * Выполняет:
   * - DROP DATABASE default
   * - CREATE DATABASE default
   * - Пересоздаёт schema_migrations
   */
  cleanupDatabase(): Promise<void>;
}
