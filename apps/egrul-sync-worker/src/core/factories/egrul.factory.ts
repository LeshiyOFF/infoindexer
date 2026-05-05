/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 *
 * Следует SRP: ответственность только за создание объектов.
 */

import { clickhouseClient } from 'shared';
import type { IMigrationRunner } from '../ports';
import { ClickHouseMigrationAdapter } from '../adapters';
import { MigrationService } from '../domain';
import { ClickHouseStagingAdapter } from '../infrastructure/adapters/clickhouse-staging.adapter';
import { EgrulTransformService } from '../services/egrul-transform.service';
import { StagingSyncService } from '../services/staging-sync.service';
import { WorkerConfig } from '../domain/value-objects/worker-config.vo';
import type { ILogger } from '../domain/ports/i-logger.port';
import { ConsoleLoggerAdapter } from '../infrastructure/adapters/console-logger.adapter';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import type { ITransformService } from '../domain/ports/i-transform-service.port';
import path from 'path';

/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Создаёт все сервисы с правильными зависимостями.
 * Обеспечивает единое место конфигурации инфраструктуры.
 */
export class EgrulWorkerFactory {
  private migrationRunner: IMigrationRunner | null = null;
  private migrationService: MigrationService | null = null;
  private stagingStorage: IStagingStoragePort | null = null;
  private transformService: ITransformService | null = null;
  private logger: ILogger | null = null;
  private workerConfig: WorkerConfig;

  private readonly migrationsDir = path.join(
    __dirname,
    '../infrastructure/migrations'
  );

  constructor(config?: Partial<{ workerConfig: WorkerConfig }>) {
    this.workerConfig = config?.workerConfig || WorkerConfig.forProduction();
  }

  /**
   * Создаёт или возвращает Migration runner
   */
  createMigrationRunner(): IMigrationRunner {
    if (!this.migrationRunner) {
      this.migrationRunner = new ClickHouseMigrationAdapter(clickhouseClient);
    }
    return this.migrationRunner;
  }

  /**
   * Создаёт или возвращает Migration service
   */
  createMigrationService(): MigrationService {
    if (!this.migrationService) {
      const runner = this.createMigrationRunner();
      this.migrationService = new MigrationService(runner, this.migrationsDir);
    }
    return this.migrationService;
  }

  /**
   * Создаёт или возвращает staging storage adapter
   */
  createStagingStorage(): IStagingStoragePort {
    if (!this.stagingStorage) {
      this.stagingStorage = new ClickHouseStagingAdapter(clickhouseClient);
    }
    return this.stagingStorage;
  }

  /**
   * Создаёт или возвращает Logger
   *
   * @remarks
   * Singleton logger instance for all components.
   */
  createLogger(): ILogger {
    if (!this.logger) {
      this.logger = new ConsoleLoggerAdapter();
    }
    return this.logger;
  }

  /**
   * Создаёт или возвращает Worker Config
   *
   * @remarks
   * Returns the worker configuration instance.
   */
  createWorkerConfig(): WorkerConfig {
    return this.workerConfig;
  }

  /**
   * Создаёт или возвращает Transform Service
   *
   * @remarks
   * Core service for staging → production transformation.
   */
  createTransformService(): ITransformService {
    if (!this.transformService) {
      const stagingStorage = this.createStagingStorage();

      this.transformService = new EgrulTransformService(
        clickhouseClient,
        stagingStorage
      );
    }
    return this.transformService;
  }

  /**
   * Создаёт Staging Sync Service
   *
   * @remarks
   * Orchestrates sync flow through staging.
   */
  createStagingSyncService(): StagingSyncService {
    const stagingStorage = this.createStagingStorage();
    return new StagingSyncService(stagingStorage);
  }

  /**
   * Закрывает все ресурсы
   */
  async shutdown(): Promise<void> {
    // ClickHouseClient управляется извне
  }
}
