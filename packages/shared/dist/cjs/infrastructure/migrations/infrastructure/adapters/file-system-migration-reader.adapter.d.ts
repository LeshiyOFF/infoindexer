import type { IMigrationFileReader, MigrationFileContent } from '../../domain/ports';
import type { MigrationCategory } from '../../domain/value-objects';
/**
 * Параметры для создания FileSystemMigrationReaderAdapter
 */
export interface FileSystemMigrationReaderAdapterParams {
    /** Базовая директория с миграциями */
    readonly migrationsBaseDir: string;
    /** Соответствие категории к поддиректории */
    readonly categoryDirs?: Readonly<Record<MigrationCategory, string>>;
}
/**
 * Адаптер для чтения миграционных файлов из файловой системы
 *
 * @remarks
 * Реализует Port IMigrationFileReader используя Node.js fs API.
 * Отвечает только за работу с файловой системой.
 */
export declare class FileSystemMigrationReaderAdapter implements IMigrationFileReader {
    private readonly migrationsBaseDir;
    private readonly categoryDirs;
    constructor(params: FileSystemMigrationReaderAdapterParams);
    /**
     * Получает список SQL файлов для категории
     *
     * @param category - Категория миграции
     * @returns Отсортированный список имён файлов
     *
     * @remarks
     * - Фильтрует по маске: XXX_description.sql
     * - Сортирует alphabetically (000, 001, ...)
     * - Возвращает пустой массив если директория не существует
     */
    listFiles(category: MigrationCategory): Promise<readonly string[]>;
    /**
     * Читает содержимое файла миграции
     *
     * @param category - Категория миграции
     * @param filename - Имя файла
     * @returns Содержимое файла и путь
     * @throws {Error} если файл не существует
     */
    readFile(category: MigrationCategory, filename: string): Promise<MigrationFileContent>;
    /**
     * Проверяет существование файла
     *
     * @param category - Категория миграции
     * @param filename - Имя файла
     * @returns true если файл существует
     */
    exists(category: MigrationCategory, filename: string): Promise<boolean>;
    /**
     * Проверяет валидность имени файла миграции
     *
     * @param filename - Имя файла
     * @returns true если соответствует маске XXX_description.sql
     *
     * @remarks
     * Маска: три цифры, подчёркивание, описание, .sql
     */
    private isValidMigrationFile;
    /**
     * Получает полный путь к файлу
     *
     * @param category - Категория миграции
     * @param filename - Имя файла
     * @returns Полный путь
     */
    private getFilepath;
    /**
     * Получает директорию для категории
     *
     * @param category - Категория миграции
     * @returns Полный путь к директории
     */
    private getCategoryDir;
    /**
     * Получает соответствие категорий к директориям по умолчанию
     *
     * @returns Соответствие категорий
     */
    private getDefaultCategoryDirs;
}
