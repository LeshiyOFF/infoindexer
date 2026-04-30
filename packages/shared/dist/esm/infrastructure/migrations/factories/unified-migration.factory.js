"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnifiedMigrationOrchestrator = createUnifiedMigrationOrchestrator;
exports.createClickHouseMigrationAdapter = createClickHouseMigrationAdapter;
exports.createUnifiedMigrationService = createUnifiedMigrationService;
const adapters_1 = require("../adapters");
const services_1 = require("../domain/services");
const parsers_1 = require("../domain/services/parsers");
const adapters_2 = require("../adapters");
const migration_lock_adapter_1 = require("../../migration-lock.adapter");
const circuit_breaker_factory_1 = require("../../circuit-breaker/factories/circuit-breaker.factory");
const factories_1 = require("../infrastructure/factories");
/**
 * Создаёт Unified Migration Orchestrator
 *
 * @param params - Параметры для создания
 * @returns IMigrationOrchestrator
 *
 * @remarks
 * Factory method для создания полного стека миграций (v2.1):
 * - ClickHouseMigrationAdapter (выполнение SQL)
 * - MigrationMetadataParser (парсинг metadata)
 * - MigrationDiscovererService (обнаружение)
 * - MigrationApplierService (применение)
 * - UnifiedMigrationService (координация)
 * - MigrationLock (distributed lock)
 * - CircuitBreaker (fault tolerance)
 * - UnifiedMigrationAdapter (оркестрация)
 */
function createUnifiedMigrationOrchestrator(params) {
    // Infrastructure Layer
    const migrationRunner = new adapters_2.ClickHouseMigrationAdapter(params.clickhouseClient);
    // Domain Layer - Parser
    const parserFactory = new factories_1.MigrationParserFactory();
    const metadataParser = new parsers_1.MigrationMetadataParser({
        strategies: parserFactory.createAll()
    });
    // Domain Layer - Discoverer
    const discoverer = new services_1.MigrationDiscovererService(metadataParser, params.migrationsBaseDir);
    // Domain Layer - Applier
    const applier = new services_1.MigrationApplierService(migrationRunner, params.migrationsBaseDir);
    // Domain Layer - Orchestrator
    const migrationService = new services_1.UnifiedMigrationService({
        discoverer,
        applier
    });
    // Infrastructure Layer - Cross-cutting concerns
    const lock = (0, migration_lock_adapter_1.createMigrationLock)(params.redisClient);
    const breaker = (0, circuit_breaker_factory_1.createCircuitBreakerForClickHouse)('migration');
    // Infrastructure Layer - Orchestrator Adapter
    return new adapters_1.UnifiedMigrationAdapter(migrationService, lock, breaker, migrationRunner);
}
/**
 * Создаёт ClickHouse Migration Adapter
 *
 * @param clickhouseClient - ClickHouse клиент
 * @returns ClickHouseMigrationAdapter
 *
 * @remarks
 * Factory method для создания адаптера выполнения миграций.
 */
function createClickHouseMigrationAdapter(clickhouseClient) {
    return new adapters_2.ClickHouseMigrationAdapter(clickhouseClient);
}
/**
 * Создаёт Unified Migration Service (v2.1)
 *
 * @param params - Параметры для создания
 * @returns UnifiedMigrationService
 *
 * @remarks
 * Factory method для создания сервиса координации миграций.
 */
function createUnifiedMigrationService(params) {
    const runner = new adapters_2.ClickHouseMigrationAdapter(params.clickhouseClient);
    const parserFactory = new factories_1.MigrationParserFactory();
    const metadataParser = new parsers_1.MigrationMetadataParser({
        strategies: parserFactory.createAll()
    });
    const discoverer = new services_1.MigrationDiscovererService(metadataParser, params.migrationsBaseDir);
    const applier = new services_1.MigrationApplierService(runner, params.migrationsBaseDir);
    const service = new services_1.UnifiedMigrationService({
        discoverer,
        applier
    });
    return { service, runner };
}
