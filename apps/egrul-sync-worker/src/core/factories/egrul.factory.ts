/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 *
 * Следует SRP: ответственность только за создание объектов.
 *
 * v1.5: Added createProductionStorage for Iteration 1.
 */

import { clickhouseClient } from 'shared';
import type { IMigrationRunner } from '../ports';
import { ClickHouseMigrationAdapter } from '../adapters';
import { MigrationService } from '../domain';
import { ClickHouseStagingAdapter } from '../infrastructure/adapters/clickhouse-staging.adapter';
import { ClickHouseProductionAdapter } from '../infrastructure/adapters/clickhouse-production.adapter';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import type { IProductionStorage } from '../domain/ports/i-production-storage.port';
import path from 'path';

/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Создаёт миграционные сервисы с правильными зависимостями.
 * Обеспечивает единое место конфигурации инфраструктуры.
 */
export class EgrulWorkerFactory {
  private migrationRunner: IMigrationRunner | null = null;
  private migrationService: MigrationService | null = null;
  private stagingStorage: IStagingStoragePort | null = null;
  private productionStorage: IProductionStorage | null = null;

  private readonly migrationsDir = path.join(
    __dirname,
    '../infrastructure/migrations'
  );

  /**
   * Создаёт или возвращает Migration runner
   *
   * @remarks
   * Адаптер для выполнения миграций ClickHouse.
   */
  createMigrationRunner(): IMigrationRunner {
    if (!this.migrationRunner) {
      this.migrationRunner = new ClickHouseMigrationAdapter(clickhouseClient);
    }
    return this.migrationRunner;
  }

  /**
   * Создаёт или возвращает Migration service
   *
   * @remarks
   * Domain сервис для автоматического применения миграций при старте.
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
   *
   * @remarks
   * Adapter for staging table operations.
   */
  createStagingStorage(): IStagingStoragePort {
    if (!this.stagingStorage) {
      this.stagingStorage = new ClickHouseStagingAdapter(clickhouseClient);
    }
    return this.stagingStorage;
  }

  /**
   * Создаёт или возвращает production storage adapter
   *
   * @remarks
   * Adapter for production table operations.
   * Added in v1.5 for Iteration 1.
   */
  createProductionStorage(): IProductionStorage {
    if (!this.productionStorage) {
      this.productionStorage = new ClickHouseProductionAdapter(clickhouseClient);
    }
    return this.productionStorage;
  }

  /**
   * Закрывает все ресурсы
   *
   * @remarks
   * В текущей реализации миграционные сервисы не требуют закрытия.
   * Метод добавлен для совместимости с паттерном Factory.
   */
  async shutdown(): Promise<void> {
    // Ничего не закрываем — ClickHouseClient управляется извне
  }
}
