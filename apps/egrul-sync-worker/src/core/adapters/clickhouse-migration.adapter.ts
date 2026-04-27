/**
 * Адаптер для выполнения миграций ClickHouse
 *
 * @remarks
 * Реализует IMigrationRunner порт с помощью ClickHouse клиента.
 * Хранит историю миграций в таблице schema_migrations.
 *
 * Следует Dependency Inversion Principle: зависит от абстракции (Port),
 * а не от конкретной реализации деталей.
 *
 * Использует state-based подход: проверяет фактическое состояние БД
 * перед применением миграции, предотвращая schema drift.
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type {
  IMigrationRunner,
  MigrationResult,
  MigrationOptions
} from '../ports';
import { MigrationStateDetector, MigrationState } from '../infrastructure/migration-state.detector';
import { MigrationApplierHelper } from '../infrastructure/migration-applier.helper';

const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Адаптер для выполнения миграций ClickHouse
 *
 * @remarks
 * Отслеживает применённые миграции через таблицу schema_migrations.
 * Обеспечивает идемпотентность — повторное применение безопасно.
 *
 * State-based подход:
 * 1. Проверяет запись в schema_migrations
 * 2. Проверяет фактическое состояние таблицы
 * 3. Применяет миграцию только если таблица отсутствует
 */
export class ClickHouseMigrationAdapter implements IMigrationRunner {
  private readonly stateDetector: MigrationStateDetector;
  private readonly applier: MigrationApplierHelper;

  constructor(client: ClickHouseClient) {
    this.stateDetector = new MigrationStateDetector(client);
    this.applier = new MigrationApplierHelper(client);
  }

  /**
   * Применяет SQL миграцию
   *
   * @remarks
   * - Проверяет историю миграций
   * - Проверяет фактическое состояние БД (state detection)
   * - Выполняет SQL только если таблица отсутствует
   * - Регистрирует миграцию в истории
   *
   * @param sql - SQL скрипт миграции
   * @param options - Опции миграции
   * @returns Результат применения
   */
  async apply(sql: string, options: MigrationOptions): Promise<MigrationResult> {
    const startTime = Date.now();

    if (options.dryRun) {
      return this.createDryRunResult(options.version, options.description, startTime);
    }

    try {
      await this.ensureMigrationsTable();

      // State-based подход: проверяем фактическое состояние
      const state = await this.stateDetector.detect(sql);

      if (state === MigrationState.EXISTS) {
        // Таблица существует - можно пропустить
        const isRecorded = await this.isRecorded(options.version);
        if (!isRecorded) {
          // Таблица есть, но записи нет - восстанавливаем историю
          await this.recordMigration(options.version, options.description);
        }
        return this.createSkipResult(options.version, startTime);
      }

      // ABSENT или UNKNOWN - применяем миграцию
      return await this.applyMigration(sql, options.version, options.description, startTime);
    } catch (error) {
      return this.createErrorResult(options.version, startTime, error);
    }
  }

  /**
   * Создаёт результат для dry-run режима
   */
  private createDryRunResult(version: string, description: string, startTime: number): MigrationResult {
    console.log(`[DRY RUN] Migration ${version}: ${description}`);
    return {
      success: true,
      version,
      durationMs: Date.now() - startTime
    };
  }

  /**
   * Создаёт результат для пропущенной миграции
   */
  private createSkipResult(version: string, startTime: number): MigrationResult {
    console.log(`Migration ${version} already applied (table exists), skipping`);
    return {
      success: true,
      version,
      durationMs: Date.now() - startTime
    };
  }

  /**
   * Применяет миграцию и регистрирует её
   *
   * @remarks
   * Использует MigrationApplierHelper для выполнения SQL.
   */
  private async applyMigration(
    sql: string,
    version: string,
    description: string,
    startTime: number
  ): Promise<MigrationResult> {
    console.log(`Applying migration ${version}: ${description}`);

    const result = await this.applier.apply(sql);
    if (!result.success) {
      return this.createErrorResult(version, startTime, result.error);
    }

    await this.recordMigration(version, description);

    const durationMs = Date.now() - startTime;
    console.log(`Migration ${version} applied in ${durationMs}ms`);

    return {
      success: true,
      version,
      durationMs
    };
  }

  /**
   * Создаёт результат ошибки
   */
  private createErrorResult(version: string, startTime: number, error: unknown): MigrationResult {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`Migration ${version} failed: ${errorMessage}`);

    return {
      success: false,
      version,
      durationMs,
      error: errorMessage
    };
  }

  /**
   * Проверяет была ли миграция записана в историю
   *
   * @param version - Версия миграции
   * @returns true если миграция записана
   */
  async isApplied(version: string): Promise<boolean> {
    try {
      await this.ensureMigrationsTable();
      return await this.isRecorded(version);
    } catch {
      return false;
    }
  }

  /**
   * Проверяет запись миграции в истории
   *
   * @param version - Версия миграции
   * @returns true если запись существует
   */
  private async isRecorded(version: string): Promise<boolean> {
    const result = await this.applier['client'].query({
      query: `
        SELECT count() as cnt
        FROM ${MIGRATIONS_TABLE}
        WHERE version = {version:String}
      `,
      query_params: { version },
      format: 'JSONEachRow'
    });

    const rows = await result.json() as Array<{ cnt: string }>;
    const count = parseInt(rows[0]?.cnt || '0', 10);

    return count > 0;
  }

  /**
   * Убеждается что таблица миграций существует
   *
   * @remarks
   * Создаёт schema_migrations если она не существует.
   * Использует MergeTree для оптимальной производительности.
   */
  private async ensureMigrationsTable(): Promise<void> {
    const exists = await this.tableExists(MIGRATIONS_TABLE);
    if (exists) {
      return;
    }

    const query = `
      CREATE TABLE ${MIGRATIONS_TABLE} (
        version String,
        description String,
        applied_at DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY version
    `;

    await this.applier['client'].command({ query });
  }

  /**
   * Проверяет существование таблицы
   *
   * @param tableName - Имя таблицы
   * @returns true если таблица существует
   */
  private async tableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.applier['client'].query({
        query: `
          SELECT count() as cnt
          FROM system.tables
          WHERE database = currentDatabase()
          AND name = {name:String}
        `,
        query_params: { name: tableName },
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ cnt: string }>;
      const count = parseInt(rows[0]?.cnt || '0', 10);

      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Регистрирует миграцию как применённую
   *
   * @param version - Версия миграции
   * @param description - Описание миграции
   */
  private async recordMigration(version: string, description: string): Promise<void> {
    await this.applier['client'].insert({
      table: MIGRATIONS_TABLE,
      values: [{ version, description }],
      format: 'JSONEachRow'
    });
  }
}
