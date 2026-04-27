/**
 * Сервис для применения миграций
 *
 * @remarks
 * Domain сервис для управления миграциями базы данных.
 * Следует SRP: отвечает за применение миграций при старте.
 *
 * Координирует применение миграций через IMigrationRunner порт.
 * Следует DRY: использует дескрипторы миграций вместо дублирования кода.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { IMigrationRunner } from '../ports';

/**
 * Дескриптор миграции
 *
 * @remarks
 * Value Object для описания миграции.
 * Следует иммутабельности: readonly свойства.
 */
interface MigrationDescriptor {
  readonly version: string;
  readonly file: string;
  readonly description: string;
}

/**
 * Сервис для применения миграций
 *
 * @remarks
 * Читает SQL файлы из директории миграций и применяет их по порядку.
 * Обеспечивает идемпотентность через проверку версий.
 *
 * DRY compliance: использует единый метод applyMigration вместо дублирования.
 */
export class MigrationService {
  private readonly migrations: ReadonlyArray<MigrationDescriptor> = [
    {
      version: '001',
      file: '001_create_resume_states.sql',
      description: 'Create resume_states table for HTTP Range resume'
    },
    {
      version: '002',
      file: '002_create_company_sanctions.sql',
      description: 'Create company_sanctions table'
    },
    {
      version: '003',
      file: '003_create_companies_meta.sql',
      description: 'Create companies_meta table'
    },
    {
      version: '004',
      file: '004_create_egrul_raw_tables.sql',
      description: 'Create EGRUL raw tables for import'
    },
    {
      version: '005',
      file: '005_create_identity_mapping.sql',
      description: 'Create identity_mapping table'
    },
    {
      version: '006',
      file: '006_create_denormalized_relations.sql',
      description: 'Create denormalized relations tables'
    },
    {
      version: '007',
      file: '007_add_normalized_inn_columns.sql',
      description: 'Add normalized INN columns'
    },
    {
      version: '008',
      file: '008_add_temporal_columns.sql',
      description: 'Add temporal columns to raw tables'
    },
    {
      version: '009',
      file: '009_create_sync_state.sql',
      description: 'Create sync state table for incremental updates'
    },
    {
      version: '010',
      file: '010_add_identity_projections.sql',
      description: 'Add projections and skipping indexes for identity_mapping optimization'
    },
    {
      version: '011',
      file: '011_alter_temporal_columns_to_datetime64.sql',
      description: 'Convert temporal columns to DateTime64(3, UTC)'
    }
  ];

  constructor(
    private readonly migrationRunner: IMigrationRunner,
    private readonly migrationsDir: string
  ) {}

  /**
   * Применяет все миграции
   *
   * @remarks
   * Применяет миграции по порядку из массива дескрипторов.
   * Пропускает уже применённые миграции.
   *
   * @throws Error если какая-либо миграция не применяется
   */
  async applyAll(): Promise<void> {
    console.log('--- CHECKING MIGRATIONS ---');

    try {
      for (const migration of this.migrations) {
        await this.applyMigration(migration);
      }

      console.log('--- MIGRATIONS COMPLETED ---');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Применяет одну миграцию
   *
   * @remarks
   * DRY compliance: единый метод для применения всех миграций.
   * Вынесен из отдельных методов для устранения дублирования.
   *
   * @param descriptor - Дескриптор миграции
   * @throws Error если миграция не применяется
   */
  private async applyMigration(descriptor: MigrationDescriptor): Promise<void> {
    const migrationPath = join(this.migrationsDir, descriptor.file);
    const sql = readFileSync(migrationPath, 'utf-8');

    const result = await this.migrationRunner.apply(sql, {
      version: descriptor.version,
      description: descriptor.description
    });

    if (result.success) {
      console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
    } else {
      throw new Error(`Migration ${result.version} failed: ${result.error}`);
    }
  }
}
