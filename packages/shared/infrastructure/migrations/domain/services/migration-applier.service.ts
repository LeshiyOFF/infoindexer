/**
 * Migration Applier Service
 *
 * @remarks
 * Сервис для применения миграций к базе данных.
 * Реализует IMigrationApplier port.
 *
 * v2.1: Вынесен из UnifiedMigrationService для соблюдения SRP.
 *
 * @pattern Single Responsibility Principle (только применение)
 * @pattern Dependency Inversion Principle (зависит от IMigrationRunner)
 */
import type { IMigrationApplier } from '../ports/i-migration-applier.port';
import type { IMigrationRunner } from '../../ports/i-migration-runner.port';
import type { MigrationDescriptor } from '../value-objects/migration-descriptor.vo';
import type { MigrationStats } from '../value-objects/migration-stats.vo';
import {
  createInitialStats,
  updateStats
} from '../value-objects/migration-stats.vo';
import {
  MigrationApplierMetrics,
  createMigrationApplierMetrics
} from './migration-applier-metrics.vo';
import { MigrationSqlReader } from './migration-sql-reader.vo';

/**
 * Сервис применения миграций
 *
 * @remarks
 * Отвечает только за применение миграций к базе данных.
 */
export class MigrationApplierService implements IMigrationApplier {
  constructor(
    private readonly migrationRunner: IMigrationRunner,
    private readonly migrationsBaseDir: string
  ) {}

  /**
   * Применяет все миграции
   *
   * @param descriptors - Дескрипторы миграций
   * @returns Статистика выполнения
   */
  async applyAll(
    descriptors: ReadonlyArray<MigrationDescriptor>
  ): Promise<MigrationStats> {
    const metrics = createMigrationApplierMetrics();
    metrics.logStart();

    let stats = createInitialStats();

    for (const descriptor of descriptors) {
      const result = await this.applyOne(descriptor);
      stats = updateStats(stats, result);

      if (result.success && !result.skipped) {
        metrics.logSuccess(descriptor, result);
      }

      if (!result.success && !result.skipped) {
        metrics.logFailure(descriptor, result);
        throw new Error(`Migration ${descriptor.version} failed: ${result.error}`);
      }
    }

    metrics.logCompletion(stats);
    return stats;
  }

  /**
   * Применяет одну миграцию
   *
   * @param descriptor - Дескриптор миграции
   * @returns Результат применения
   */
  private async applyOne(
    descriptor: MigrationDescriptor
  ): Promise<MigrationResult> {
    const startTime = Date.now();

    try {
      const isApplied = await this.migrationRunner.isApplied(
        descriptor.category,
        descriptor.version
      );

      if (isApplied) {
        return MigrationApplierMetrics.createSkipResult(startTime);
      }

      const sql = this.readSql(descriptor);
      const result = await this.migrationRunner.apply(sql, {
        category: descriptor.category,
        version: descriptor.version,
        description: descriptor.description
      });

      if (!result.success) {
        return MigrationApplierMetrics.createFailureResult(result, startTime);
      }

      return MigrationApplierMetrics.createSuccessResult(result, startTime);
    } catch (error) {
      return MigrationApplierMetrics.createErrorResult(error, startTime);
    }
  }

  /**
   * Читает SQL файл
   *
   * @param descriptor - Дескриптор миграции
   * @returns Содержимое SQL файла
   */
  private readSql(descriptor: MigrationDescriptor): string {
    const reader = new MigrationSqlReader(this.migrationsBaseDir);
    return reader.read(descriptor);
  }
}

/**
 * Результат применения одной миграции
 */
interface MigrationResult {
  readonly success: boolean;
  readonly skipped: boolean;
  readonly durationMs: number;
  readonly error?: string;
}
