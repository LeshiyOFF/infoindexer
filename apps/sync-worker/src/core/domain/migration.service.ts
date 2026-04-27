/**
 * Сервис для применения миграций
 *
 * @remarks
 * Domain сервис для управления миграциями базы данных.
 * Следует SRP: отвечает за применение миграций при старте.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { IMigrationRunner } from '../ports';

/**
 * Сервис для применения миграций
 */
export class MigrationService {
  constructor(
    private readonly migrationRunner: IMigrationRunner,
    private readonly migrationsDir: string
  ) {}

  /**
   * Применяет все миграции
   *
   * @remarks
   * Читает SQL файлы из директории миграций и применяет их по порядку.
   */
  async applyAll(): Promise<void> {
    console.log('--- CHECKING MIGRATIONS ---');

    try {
      await this.applyCheckpointsMigration();
      await this.applyFinancialReportsMigration();
      await this.applyExemptionCriteriaEnumMigration();
      await this.applyGeocodingQualityStringMigration();

      console.log('--- MIGRATIONS COMPLETED ---');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Применяет миграцию sync_checkpoints
   */
  private async applyCheckpointsMigration(): Promise<void> {
    const migrationPath = join(
      this.migrationsDir,
      '000_create_sync_checkpoints.sql'
    );

    const sql = readFileSync(migrationPath, 'utf-8');

    const result = await this.migrationRunner.apply(sql, {
      version: '000',
      description: 'Create sync_checkpoints table'
    });

    if (result.success) {
      console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
    } else {
      throw new Error(
        `Migration ${result.version} failed: ${result.error}`
      );
    }
  }

  /**
   * Убеждается что таблица миграций существует
   */
  private async ensureTable(): Promise<void> {
    // Таблица создается автоматически в ClickHouseMigrationAdapter
  }

  /**
   * Применяет миграцию financial_reports ReplacingMergeTree
   */
  private async applyFinancialReportsMigration(): Promise<void> {
    const migrationPath = join(
      this.migrationsDir,
      '001_financial_reports_replacingmerge.sql'
    );

    const sql = readFileSync(migrationPath, 'utf-8');

    const result = await this.migrationRunner.apply(sql, {
      version: '001',
      description: 'ReplacingMergeTree для financial_reports'
    });

    if (result.success) {
      console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
    } else {
      throw new Error(
        `Migration ${result.version} failed: ${result.error}`
      );
    }
  }

  /**
   * Применяет миграцию TTL для автоудаления
   */
  private async applyTtlMigration(): Promise<void> {
    const migrationPath = join(
      this.migrationsDir,
      '002_add_ttl.sql'
    );

    const sql = readFileSync(migrationPath, 'utf-8');

    const result = await this.migrationRunner.apply(sql, {
      version: '002',
      description: 'TTL для автоудаления старых данных'
    });

    if (result.success) {
      console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
    } else {
      throw new Error(
        `Migration ${result.version} failed: ${result.error}`
      );
    }
  }

  /**
   * Применяет миграцию exemption_criteria Enum8
   */
  private async applyExemptionCriteriaEnumMigration(): Promise<void> {
    const migrationPath = join(
      this.migrationsDir,
      '005_exemption_criteria_enum.sql'
    );

    const sql = readFileSync(migrationPath, 'utf-8');

    const result = await this.migrationRunner.apply(sql, {
      version: '005',
      description: 'exemption_criteria Enum8 type safety'
    });

    if (result.success) {
      console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
    } else {
      throw new Error(
        `Migration ${result.version} failed: ${result.error}`
      );
    }
  }

  /**
   * Применяет миграцию geocoding_quality LowCardinality(String)
   */
  private async applyGeocodingQualityStringMigration(): Promise<void> {
    const migrationPath = join(
      this.migrationsDir,
      '006_geocoding_quality_string.sql'
    );

    const sql = readFileSync(migrationPath, 'utf-8');

    const result = await this.migrationRunner.apply(sql, {
      version: '006',
      description: 'geocoding_quality LowCardinality(String) type fix'
    });

    if (result.success) {
      console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
    } else {
      throw new Error(
        `Migration ${result.version} failed: ${result.error}`
      );
    }
  }

}
