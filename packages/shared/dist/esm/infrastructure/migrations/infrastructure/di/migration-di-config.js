import { MigrationMetadataParser } from '../../domain/services/parsers';
import { MigrationParserFactory } from '../factories';
import { FileSystemMigrationReaderAdapter } from '../adapters';
/**
 * Создаёт сервисы миграций с настройками по умолчанию
 *
 * @param config - Настройки DI
 * @returns Сервисы миграций
 *
 * @remarks
 * Factory method для создания всей цепочки зависимостей.
 */
export function createMigrationServices(config) {
    // Infrastructure Layer
    const fileReader = new FileSystemMigrationReaderAdapter({
        migrationsBaseDir: config.migrationsBaseDir
    });
    // Domain Layer
    const parserFactory = new MigrationParserFactory();
    const metadataParser = new MigrationMetadataParser({
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
export function createMigrationServicesForTesting(config, customStrategies) {
    const fileReader = new FileSystemMigrationReaderAdapter({
        migrationsBaseDir: config.migrationsBaseDir
    });
    const metadataParser = new MigrationMetadataParser({
        strategies: customStrategies
    });
    return {
        fileReader,
        metadataParser
    };
}
