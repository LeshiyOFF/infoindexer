"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMigrationServices = createMigrationServices;
exports.createMigrationServicesForTesting = createMigrationServicesForTesting;
const parsers_1 = require("../../domain/services/parsers");
const factories_1 = require("../factories");
const adapters_1 = require("../adapters");
/**
 * Создаёт сервисы миграций с настройками по умолчанию
 *
 * @param config - Настройки DI
 * @returns Сервисы миграций
 *
 * @remarks
 * Factory method для создания всей цепочки зависимостей.
 */
function createMigrationServices(config) {
    // Infrastructure Layer
    const fileReader = new adapters_1.FileSystemMigrationReaderAdapter({
        migrationsBaseDir: config.migrationsBaseDir
    });
    // Domain Layer
    const parserFactory = new factories_1.MigrationParserFactory();
    const metadataParser = new parsers_1.MigrationMetadataParser({
        strategies: parserFactory.createAll()
    });
    return {
        fileReader,
        metadataParser
    };
}
/**
 * Создаёт сервисы для тестирования
 *
 * @param config - Настройки DI
 * @param customStrategies - Кастомные стратегии для тестов
 * @returns Сервисы миграций
 *
 * @remarks
 * Позволяет подменять стратегии в тестах.
 */
function createMigrationServicesForTesting(config, customStrategies) {
    const fileReader = new adapters_1.FileSystemMigrationReaderAdapter({
        migrationsBaseDir: config.migrationsBaseDir
    });
    const metadataParser = new parsers_1.MigrationMetadataParser({
        strategies: customStrategies
    });
    return {
        fileReader,
        metadataParser
    };
}
