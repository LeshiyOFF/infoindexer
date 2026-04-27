"use strict";
/**
 * Factory для создания сервисов синхронизации
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncFactory = void 0;
const shared_1 = require("shared");
const adapters_1 = require("../adapters");
const adapters_2 = require("../adapters");
const adapters_3 = require("../adapters");
const adapters_4 = require("../adapters");
const adapters_5 = require("../adapters");
const redis_clickhouse_checkpoint_adapter_1 = require("../adapters/checkpoint/redis-clickhouse-checkpoint.adapter");
const column_mapper_service_1 = require("../domain/column-mapper.service");
const checkpoint_manager_service_1 = require("../domain/checkpoint-manager.service");
const migration_service_1 = require("../domain/migration.service");
const sync_orchestrator_service_1 = require("../domain/sync-orchestrator.service");
const path_1 = __importDefault(require("path"));
/**
 * Factory для создания сервисов синхронизации
 */
class SyncFactory {
    parquetReader = null;
    storage = null;
    reporter = null;
    messageBus = null;
    checkpointStorage = null;
    checkpointManager = null;
    mapper = null;
    orchestrator = null;
    csvPath = path_1.default.join(__dirname, '../../../descriptive_names_dict.csv');
    /**
     * Создаёт или возвращает Parquet reader
     */
    createParquetReader() {
        if (!this.parquetReader) {
            this.parquetReader = new adapters_1.DuckDBParquetAdapter();
        }
        return this.parquetReader;
    }
    /**
     * Создаёт или возвращает ClickHouse storage
     */
    createStorage() {
        if (!this.storage) {
            this.storage = new adapters_2.ClickHouseStorageAdapter(shared_1.clickhouseClient);
        }
        return this.storage;
    }
    /**
     * Создаёт или возвращает Progress reporter
     */
    createProgressReporter() {
        if (!this.reporter) {
            this.reporter = new adapters_4.RedisProgressAdapter(shared_1.redisClient);
        }
        return this.reporter;
    }
    /**
     * Создаёт или возвращает Checkpoint storage adapter
     */
    createCheckpointStorage() {
        if (!this.checkpointStorage) {
            this.checkpointStorage = new redis_clickhouse_checkpoint_adapter_1.RedisClickHouseCheckpointAdapter(shared_1.redisClient, shared_1.clickhouseClient);
        }
        return this.checkpointStorage;
    }
    /**
     * Создаёт или возвращает Checkpoint manager
     *
     * @remarks
     * Domain сервис для управления чекпоинтами.
     */
    createCheckpointManager() {
        if (!this.checkpointManager) {
            const checkpointStorage = this.createCheckpointStorage();
            const storage = this.createStorage();
            this.checkpointManager = new checkpoint_manager_service_1.CheckpointManager(checkpointStorage, storage);
        }
        return this.checkpointManager;
    }
    /**
     * Создаёт или возвращает Message bus
     */
    createMessageBus() {
        if (!this.messageBus) {
            this.messageBus = new adapters_5.RedisMessageBusAdapter(shared_1.redisPub, shared_1.redisSub);
        }
        return this.messageBus;
    }
    /**
     * Создаёт или возвращает Column mapper
     */
    createColumnMapper() {
        if (!this.mapper) {
            this.mapper = new column_mapper_service_1.ColumnMapper(this.csvPath);
        }
        return this.mapper;
    }
    /**
     * Создаёт или возвращает Sync orchestrator
     */
    createOrchestrator(config) {
        if (!this.orchestrator) {
            const reader = this.createParquetReader();
            const storage = this.createStorage();
            const reporter = this.createProgressReporter();
            const mapper = this.createColumnMapper();
            const checkpoint = this.createCheckpointManager();
            this.orchestrator = new sync_orchestrator_service_1.SyncOrchestrator(reader, storage, reporter, mapper, config, checkpoint);
        }
        return this.orchestrator;
    }
    /**
     * Создаёт Migration runner для применения миграций
     */
    createMigrationRunner() {
        return new adapters_3.ClickHouseMigrationAdapter(shared_1.clickhouseClient);
    }
    /**
     * Создаёт Migration service для автоматического применения миграций
     */
    createMigrationService() {
        const runner = this.createMigrationRunner();
        const migrationsDir = path_1.default.join(__dirname, '../../core/infrastructure/migrations');
        return new migration_service_1.MigrationService(runner, migrationsDir);
    }
    /**
     * Закрывает все ресурсы
     */
    async shutdown() {
        if (this.parquetReader) {
            await this.parquetReader.close();
            this.parquetReader = null;
        }
    }
}
exports.SyncFactory = SyncFactory;
