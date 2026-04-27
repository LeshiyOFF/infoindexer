/**
 * Factory для создания сервисов синхронизации
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 */

import { clickhouseClient, redisClient, redisPub, redisSub } from 'shared';
import type { IParquetReader, IClickHouseStorage, IProgressReporter, IMessageBus, ICheckpointStorage, IMigrationRunner } from '../ports';
import type { SyncOrchestrator } from '../domain';
import type { SyncConfig } from '../types';
import { DuckDBParquetAdapter } from '../adapters';
import { ClickHouseStorageAdapter } from '../adapters';
import { ClickHouseMigrationAdapter } from '../adapters';
import { RedisProgressAdapter } from '../adapters';
import { RedisMessageBusAdapter } from '../adapters';
import { RedisClickHouseCheckpointAdapter } from '../adapters/checkpoint/redis-clickhouse-checkpoint.adapter';
import { ColumnMapper } from '../domain/column-mapper.service';
import { CheckpointManager } from '../domain/checkpoint-manager.service';
import { MigrationService } from '../domain/migration.service';
import { SyncOrchestrator as DomainSyncOrchestrator } from '../domain/sync-orchestrator.service';
import path from 'path';

/**
 * Factory для создания сервисов синхронизации
 */
export class SyncFactory {
  private parquetReader: IParquetReader | null = null;
  private storage: IClickHouseStorage | null = null;
  private reporter: IProgressReporter | null = null;
  private messageBus: IMessageBus | null = null;
  private checkpointStorage: ICheckpointStorage | null = null;
  private checkpointManager: CheckpointManager | null = null;
  private mapper: ColumnMapper | null = null;
  private orchestrator: SyncOrchestrator | null = null;

  private readonly csvPath = path.join(__dirname, '../../../descriptive_names_dict.csv');

  /**
   * Создаёт или возвращает Parquet reader
   */
  createParquetReader(): IParquetReader {
    if (!this.parquetReader) {
      this.parquetReader = new DuckDBParquetAdapter();
    }
    return this.parquetReader;
  }

  /**
   * Создаёт или возвращает ClickHouse storage
   */
  createStorage(): IClickHouseStorage {
    if (!this.storage) {
      this.storage = new ClickHouseStorageAdapter(clickhouseClient);
    }
    return this.storage;
  }

  /**
   * Создаёт или возвращает Progress reporter
   */
  createProgressReporter(): IProgressReporter {
    if (!this.reporter) {
      this.reporter = new RedisProgressAdapter(redisClient);
    }
    return this.reporter;
  }

  /**
   * Создаёт или возвращает Checkpoint storage adapter
   */
  createCheckpointStorage(): ICheckpointStorage {
    if (!this.checkpointStorage) {
      this.checkpointStorage = new RedisClickHouseCheckpointAdapter(redisClient, clickhouseClient);
    }
    return this.checkpointStorage;
  }

  /**
   * Создаёт или возвращает Checkpoint manager
   *
   * @remarks
   * Domain сервис для управления чекпоинтами.
   */
  createCheckpointManager(): CheckpointManager {
    if (!this.checkpointManager) {
      const checkpointStorage = this.createCheckpointStorage();
      const storage = this.createStorage();
      this.checkpointManager = new CheckpointManager(checkpointStorage, storage);
    }
    return this.checkpointManager;
  }

  /**
   * Создаёт или возвращает Message bus
   */
  createMessageBus(): IMessageBus {
    if (!this.messageBus) {
      this.messageBus = new RedisMessageBusAdapter(redisPub, redisSub);
    }
    return this.messageBus;
  }

  /**
   * Создаёт или возвращает Column mapper
   */
  createColumnMapper(): ColumnMapper {
    if (!this.mapper) {
      this.mapper = new ColumnMapper(this.csvPath);
    }
    return this.mapper;
  }

  /**
   * Создаёт или возвращает Sync orchestrator
   */
  createOrchestrator(config: SyncConfig): SyncOrchestrator {
    if (!this.orchestrator) {
      const reader = this.createParquetReader();
      const storage = this.createStorage();
      const reporter = this.createProgressReporter();
      const mapper = this.createColumnMapper();
      const checkpoint = this.createCheckpointManager();

      this.orchestrator = new DomainSyncOrchestrator(reader, storage, reporter, mapper, config, checkpoint);
    }
    return this.orchestrator;
  }

  /**
   * Создаёт Migration runner для применения миграций
   */
  createMigrationRunner(): IMigrationRunner {
    return new ClickHouseMigrationAdapter(clickhouseClient);
  }

  /**
   * Создаёт Migration service для автоматического применения миграций
   */
  createMigrationService(): MigrationService {
    const runner = this.createMigrationRunner();
    const migrationsDir = path.join(__dirname, '../../core/infrastructure/migrations');
    return new MigrationService(runner, migrationsDir);
  }

  /**
   * Закрывает все ресурсы
   */
  async shutdown(): Promise<void> {
    if (this.parquetReader) {
      await this.parquetReader.close();
      this.parquetReader = null;
    }
  }
}
