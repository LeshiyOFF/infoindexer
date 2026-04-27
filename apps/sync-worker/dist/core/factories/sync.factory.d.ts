/**
 * Factory для создания сервисов синхронизации
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 */
import type { IParquetReader, IClickHouseStorage, IProgressReporter, IMessageBus, ICheckpointStorage, IMigrationRunner } from '../ports';
import type { SyncOrchestrator } from '../domain';
import type { SyncConfig } from '../types';
import { ColumnMapper } from '../domain/column-mapper.service';
import { CheckpointManager } from '../domain/checkpoint-manager.service';
import { MigrationService } from '../domain/migration.service';
/**
 * Factory для создания сервисов синхронизации
 */
export declare class SyncFactory {
    private parquetReader;
    private storage;
    private reporter;
    private messageBus;
    private checkpointStorage;
    private checkpointManager;
    private mapper;
    private orchestrator;
    private readonly csvPath;
    /**
     * Создаёт или возвращает Parquet reader
     */
    createParquetReader(): IParquetReader;
    /**
     * Создаёт или возвращает ClickHouse storage
     */
    createStorage(): IClickHouseStorage;
    /**
     * Создаёт или возвращает Progress reporter
     */
    createProgressReporter(): IProgressReporter;
    /**
     * Создаёт или возвращает Checkpoint storage adapter
     */
    createCheckpointStorage(): ICheckpointStorage;
    /**
     * Создаёт или возвращает Checkpoint manager
     *
     * @remarks
     * Domain сервис для управления чекпоинтами.
     */
    createCheckpointManager(): CheckpointManager;
    /**
     * Создаёт или возвращает Message bus
     */
    createMessageBus(): IMessageBus;
    /**
     * Создаёт или возвращает Column mapper
     */
    createColumnMapper(): ColumnMapper;
    /**
     * Создаёт или возвращает Sync orchestrator
     */
    createOrchestrator(config: SyncConfig): SyncOrchestrator;
    /**
     * Создаёт Migration runner для применения миграций
     */
    createMigrationRunner(): IMigrationRunner;
    /**
     * Создаёт Migration service для автоматического применения миграций
     */
    createMigrationService(): MigrationService;
    /**
     * Закрывает все ресурсы
     */
    shutdown(): Promise<void>;
}
