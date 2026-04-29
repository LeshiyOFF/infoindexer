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
 * v1.5: Added createProductionStorage for Iteration 1.
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
const path_1 = __importDefault(require("path"));
/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Создаёт миграционные сервисы с правильными зависимостями.
 * Обеспечивает единое место конфигурации инфраструктуры.
 */
class EgrulWorkerFactory {
    migrationRunner = null;
    migrationService = null;
    stagingStorage = null;
    productionStorage = null;
    migrationsDir = path_1.default.join(__dirname, '../infrastructure/migrations');
    /**
     * Создаёт или возвращает Migration runner
     *
     * @remarks
     * Адаптер для выполнения миграций ClickHouse.
     */
    createMigrationRunner() {
        if (!this.migrationRunner) {
            this.migrationRunner = new adapters_1.ClickHouseMigrationAdapter(shared_1.clickhouseClient);
        }
        return this.migrationRunner;
    }
    /**
     * Создаёт или возвращает Migration service
     *
     * @remarks
     * Domain сервис для автоматического применения миграций при старте.
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
     *
     * @remarks
     * Adapter for staging table operations.
     */
    createStagingStorage() {
        if (!this.stagingStorage) {
            this.stagingStorage = new clickhouse_staging_adapter_1.ClickHouseStagingAdapter(shared_1.clickhouseClient);
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
    createProductionStorage() {
        if (!this.productionStorage) {
            this.productionStorage = new clickhouse_production_adapter_1.ClickHouseProductionAdapter(shared_1.clickhouseClient);
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
    async shutdown() {
        // Ничего не закрываем — ClickHouseClient управляется извне
    }
}
exports.EgrulWorkerFactory = EgrulWorkerFactory;
