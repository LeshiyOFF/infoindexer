"use strict";
/**
 * Unified Migration Factory
 *
 * @remarks
 * Factory для создания компонентов миграций.
 * Следует SRP: ответственен только за создание.
 * Следует DIP: возвращает абстракции (порты).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnifiedMigrationOrchestrator = createUnifiedMigrationOrchestrator;
exports.createClickHouseMigrationAdapter = createClickHouseMigrationAdapter;
exports.createUnifiedMigrationService = createUnifiedMigrationService;
const adapters_1 = require("../adapters");
const services_1 = require("../domain/services");
const adapters_2 = require("../adapters");
const migration_lock_adapter_1 = require("../../migration-lock.adapter");
const circuit_breaker_factory_1 = require("../../circuit-breaker/factories/circuit-breaker.factory");
/**
 * Создаёт Unified Migration Orchestrator
 *
 * @param params - Параметры для создания
 * @returns IMigrationOrchestrator
 *
 * @remarks
 * Factory method для создания полного стека миграций:
 * - ClickHouseMigrationAdapter (выполнение SQL)
 * - UnifiedMigrationService (координация)
 * - MigrationLock (distributed lock)
 * - CircuitBreaker (fault tolerance)
 * - UnifiedMigrationAdapter (оркестрация)
 */
function createUnifiedMigrationOrchestrator(params) {
    // Создаём адаптер для выполнения миграций
    const migrationRunner = new adapters_2.ClickHouseMigrationAdapter(params.clickhouseClient);
    // Создаём сервис для координации миграций
    const migrationService = new services_1.UnifiedMigrationService({
        migrationRunner,
        migrationsBaseDir: params.migrationsBaseDir
    });
    // Создаём distributed lock
    const lock = (0, migration_lock_adapter_1.createMigrationLock)(params.redisClient);
    // Создаём circuit breaker
    const breaker = (0, circuit_breaker_factory_1.createCircuitBreakerForClickHouse)('migration');
    // Создаём адаптер оркестрации
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
 * Используется для тестирования или специфичных случаев.
 */
function createClickHouseMigrationAdapter(clickhouseClient) {
    return new adapters_2.ClickHouseMigrationAdapter(clickhouseClient);
}
/**
 * Создаёт Unified Migration Service
 *
 * @param params - Параметры для создания
 * @returns UnifiedMigrationService
 *
 * @remarks
 * Factory method для создания сервиса координации миграций.
 * Используется для тестирования или специфичных случаев.
 */
function createUnifiedMigrationService(params) {
    const runner = new adapters_2.ClickHouseMigrationAdapter(params.clickhouseClient);
    const service = new services_1.UnifiedMigrationService({
        migrationRunner: runner,
        migrationsBaseDir: params.migrationsBaseDir
    });
    return { service, runner };
}
