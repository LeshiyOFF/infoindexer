import type { IMigrationDiscoverer } from '../ports/i-migration-discoverer.port';
import type { MigrationDescriptor } from '../value-objects/migration-descriptor.vo';
import { MigrationMetadataParser } from './parsers';
/**
 * Сервис обнаружения миграций
 *
 * @remarks
 * Отвечает только за сканирование файловой системы
 * и построение дескрипторов миграций.
 */
export declare class MigrationDiscovererService implements IMigrationDiscoverer {
    private readonly metadataParser;
    private readonly migrationsBaseDir;
    private readonly categories;
    constructor(metadataParser: MigrationMetadataParser, migrationsBaseDir: string);
    /**
     * Обнаруживает все миграции
     *
     * @returns Отсортированный список дескрипторов
     */
    discover(): ReadonlyArray<MigrationDescriptor>;
    /**
     * Обнаруживает с fallback на legacy
     *
     * @returns Отсортированные дескрипторы
     */
    private discoverWithFallback;
    /**
     * Сканирует файловую систему
     *
     * @returns Дескрипторы из ФС
     */
    private scanFilesystem;
    /**
     * Сканирует категорию
     *
     * @param category - Категория миграции
     * @returns Дескрипторы категории
     */
    private scanCategory;
    /**
     * Получает список SQL файлов
     *
     * @param dir - Директория
     * @returns Отсортированный список файлов
     */
    private listSqlFiles;
    /**
     * Парсит файл миграции
     *
     * @param category - Категория
     * @param filename - Имя файла
     * @returns Дескриптор миграции
     */
    private parseFile;
    /**
     * Извлекает версию из имени файла
     *
     * @param filename - Имя файла
     * @returns Версия
     */
    private extractVersion;
    /**
     * Сортирует дескрипторы по версии
     *
     * @param descriptors - Дескрипторы
     * @returns Отсортированные дескрипторы
     */
    private sortByVersion;
}
