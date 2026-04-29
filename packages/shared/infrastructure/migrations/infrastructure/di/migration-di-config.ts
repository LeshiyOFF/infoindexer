/**
 * Migration DI Configuration
 *
 * @remarks
 * Конфигурация зависимостей для модуля миграций.
 * Следует Dependency Injection pattern.
 *
 * @pattern Dependency Injection
 * @pattern Single Responsibility Principle
 */
import type { IMigrationFileReader, IMetadataParser } from '../../domain/ports';
import { MigrationMetadataParser } from '../../domain/services/parsers';
import { MigrationParserFactory } from '../factories';
import { FileSystemMigrationReaderAdapter } from '../adapters';

/**
 * Настройки для DI контейнера
 */
export interface MigrationDIConfig {
  /** Базовая директория с миграциями */
  readonly migrationsBaseDir: string;
}

/**
 * Результат создания сервисов
 *
 * @remarks
 * Value Object с readonly свойствами.
 */
export interface MigrationServices {
  /** Ридер файловой системы */
  readonly fileReader: IMigrationFileReader;

  /** Парсер метаданных */
  readonly metadataParser: MigrationMetadataParser;
}

/**
 * Создаёт сервисы миграций с настройками по умолчанию
 *
 * @param config - Настройки DI
 * @returns Сервисы миграций
 *
 * @remarks
 * Factory method для создания всей цепочки зависимостей.
 */
export function createMigrationServices(config: MigrationDIConfig): MigrationServices {
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
export function createMigrationServicesForTesting(
  config: MigrationDIConfig,
  customStrategies?: readonly IMetadataParser[]
): MigrationServices {
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
