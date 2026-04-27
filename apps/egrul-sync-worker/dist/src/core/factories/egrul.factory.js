"use strict";
/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 *
 * Следует SRP: ответственность только за создание объектов.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EgrulWorkerFactory = void 0;
const shared_1 = require("shared");
const adapters_1 = require("../adapters");
const domain_1 = require("../domain");
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
