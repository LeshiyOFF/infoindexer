/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 *
 * Следует SRP: ответственность только за создание объектов.
 *
 * v2.1: Added ILogger, WorkerConfig, updated TransformPollingWorker (Iteration 4).
 */

import { clickhouseClient } from 'shared';
import type { IMigrationRunner } from '../ports';
import { ClickHouseMigrationAdapter } from '../adapters';
import { MigrationService } from '../domain';
import { ClickHouseStagingAdapter } from '../infrastructure/adapters/clickhouse-staging.adapter';
import { ClickHouseProductionAdapter } from '../infrastructure/adapters/clickhouse-production.adapter';
import { MemoryMonitorAdapter } from '../infrastructure/adapters/memory-monitor-adapter.service';
import { EgrulTransformService } from '../services/egrul-transform.service';
import { TransformPollingWorker } from '../workers/transform-polling.worker';
import { StagingSyncService } from '../services/staging-sync.service';
import { StagingConfig } from '../domain/value-objects/staging-config.vo';
import { WorkerConfig } from '../domain/value-objects/worker-config.vo';
import type { ILogger } from '../domain/ports/i-logger.port';
import { ConsoleLoggerAdapter } from '../infrastructure/adapters/console-logger.adapter';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import type { IProductionStorage } from '../domain/ports/i-production-storage.port';
import type { IMemoryMonitor } from '../domain/ports/i-memory-monitor.port';
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
  private productionStorage: IProductionStorage | null = null;
  private memoryMonitor: IMemoryMonitor | null = null;
  private transformService: ITransformService | null = null;
  private logger: ILogger | null = null;
  private stagingConfig: StagingConfig;
  private workerConfig: WorkerConfig;

  private readonly migrationsDir = path.join(
    __dirname,
    '../infrastructure/migrations'
  );

  constructor(config?: Partial<{ stagingConfig: StagingConfig; workerConfig: WorkerConfig }>) {
    this.stagingConfig = config?.stagingConfig || StagingConfig.forProduction();
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
   * Создаёт или возвращает production storage adapter
   */
  createProductionStorage(): IProductionStorage {
    if (!this.productionStorage) {
      this.productionStorage = new ClickHouseProductionAdapter(clickhouseClient);
    }
    return this.productionStorage;
  }

  /**
   * Создаёт или возвращает memory monitor adapter
   *
   * @remarks
   * Added for Transform Service memory checking.
   */
  createMemoryMonitor(): IMemoryMonitor {
    if (!this.memoryMonitor) {
      this.memoryMonitor = new MemoryMonitorAdapter(clickhouseClient);
    }
    return this.memoryMonitor;
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
      const productionStorage = this.createProductionStorage();
      const memoryMonitor = this.createMemoryMonitor();

      this.transformService = new EgrulTransformService(
        clickhouseClient,
        stagingStorage,
        productionStorage,
        memoryMonitor,
        this.stagingConfig
      );
    }
    return this.transformService;
  }

  /**
   * Создаёт Transform Polling Worker
   *
   * @remarks
   * Background worker for automatic transform triggering.
   */
  createTransformPollingWorker(): TransformPollingWorker {
    const transformService = this.createTransformService();
    const logger = this.createLogger();
    return new TransformPollingWorker(
      transformService,
      this.workerConfig,
      undefined,
      logger
    );
  }

  /**
   * Создаёт Staging Sync Service
   *
   * @remarks
   * Orchestrates sync flow through staging.
   */
  createStagingSyncService(): StagingSyncService {
    const stagingStorage = this.createStagingStorage();
    const transformService = this.createTransformService();
    return new StagingSyncService(stagingStorage, transformService);
  }

  /**
   * Закрывает все ресурсы
   */
  async shutdown(): Promise<void> {
    // ClickHouseClient управляется извне
  }
}
