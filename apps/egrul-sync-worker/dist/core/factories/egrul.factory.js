"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EgrulWorkerFactory = void 0;
const shared_1 = require("shared");
const adapters_1 = require("../adapters");
const domain_1 = require("../domain");
const clickhouse_staging_adapter_1 = require("../infrastructure/adapters/clickhouse-staging.adapter");
const clickhouse_production_adapter_1 = require("../infrastructure/adapters/clickhouse-production.adapter");
const memory_monitor_adapter_service_1 = require("../infrastructure/adapters/memory-monitor-adapter.service");
const egrul_transform_service_1 = require("../services/egrul-transform.service");
const transform_polling_worker_1 = require("../workers/transform-polling.worker");
const staging_sync_service_1 = require("../services/staging-sync.service");
const staging_config_vo_1 = require("../domain/value-objects/staging-config.vo");
const worker_config_vo_1 = require("../domain/value-objects/worker-config.vo");
const console_logger_adapter_1 = require("../infrastructure/adapters/console-logger.adapter");
const path_1 = __importDefault(require("path"));
/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Создаёт все сервисы с правильными зависимостями.
 * Обеспечивает единое место конфигурации инфраструктуры.
 */
class EgrulWorkerFactory {
    migrationRunner = null;
    migrationService = null;
    stagingStorage = null;
    productionStorage = null;
    memoryMonitor = null;
    transformService = null;
    logger = null;
    stagingConfig;
    workerConfig;
    migrationsDir = path_1.default.join(__dirname, '../infrastructure/migrations');
    constructor(config) {
        this.stagingConfig = config?.stagingConfig || staging_config_vo_1.StagingConfig.forProduction();
        this.workerConfig = config?.workerConfig || worker_config_vo_1.WorkerConfig.forProduction();
    }
    /**
     * Создаёт или возвращает Migration runner
     */
    createMigrationRunner() {
        if (!this.migrationRunner) {
            this.migrationRunner = new adapters_1.ClickHouseMigrationAdapter(shared_1.clickhouseClient);
        }
        return this.migrationRunner;
    }
    /**
     * Создаёт или возвращает Migration service
     */
    createMigrationService() {
        if (!this.migrationService) {
            const runner = this.createMigrationRunner();
            this.migrationService = new domain_1.MigrationService(runner, this.migrationsDir);
        }
        return this.migrationService;
    }
    /**
     * Создаёт или возвращает staging storage adapter
     */
    createStagingStorage() {
        if (!this.stagingStorage) {
            this.stagingStorage = new clickhouse_staging_adapter_1.ClickHouseStagingAdapter(shared_1.clickhouseClient);
        }
        return this.stagingStorage;
    }
    /**
     * Создаёт или возвращает production storage adapter
     */
    createProductionStorage() {
        if (!this.productionStorage) {
            this.productionStorage = new clickhouse_production_adapter_1.ClickHouseProductionAdapter(shared_1.clickhouseClient);
        }
        return this.productionStorage;
    }
    /**
     * Создаёт или возвращает memory monitor adapter
     *
     * @remarks
     * Added for Transform Service memory checking.
     */
    createMemoryMonitor() {
        if (!this.memoryMonitor) {
            this.memoryMonitor = new memory_monitor_adapter_service_1.MemoryMonitorAdapter(shared_1.clickhouseClient);
        }
        return this.memoryMonitor;
    }
    /**
     * Создаёт или возвращает Logger
     *
     * @remarks
     * Singleton logger instance for all components.
     */
    createLogger() {
        if (!this.logger) {
            this.logger = new console_logger_adapter_1.ConsoleLoggerAdapter();
        }
        return this.logger;
    }
    /**
     * Создаёт или возвращает Worker Config
     *
     * @remarks
     * Returns the worker configuration instance.
     */
    createWorkerConfig() {
        return this.workerConfig;
    }
    /**
     * Создаёт или возвращает Transform Service
     *
     * @remarks
     * Core service for staging → production transformation.
     */
    createTransformService() {
        if (!this.transformService) {
            const stagingStorage = this.createStagingStorage();
            const productionStorage = this.createProductionStorage();
            const memoryMonitor = this.createMemoryMonitor();
            this.transformService = new egrul_transform_service_1.EgrulTransformService(shared_1.clickhouseClient, stagingStorage, productionStorage, memoryMonitor, this.stagingConfig);
        }
        return this.transformService;
    }
    /**
     * Создаёт Transform Polling Worker
     *
     * @remarks
     * Background worker for automatic transform triggering.
     */
    createTransformPollingWorker() {
        const transformService = this.createTransformService();
        const logger = this.createLogger();
        return new transform_polling_worker_1.TransformPollingWorker(transformService, this.workerConfig, undefined, logger);
    }
    /**
     * Создаёт Staging Sync Service
     *
     * @remarks
     * Orchestrates sync flow through staging.
     */
    createStagingSyncService() {
        const stagingStorage = this.createStagingStorage();
        const transformService = this.createTransformService();
        return new staging_sync_service_1.StagingSyncService(stagingStorage, transformService);
    }
    /**
     * Закрывает все ресурсы
     */
    async shutdown() {
        // ClickHouseClient управляется извне
    }
}
exports.EgrulWorkerFactory = EgrulWorkerFactory;
