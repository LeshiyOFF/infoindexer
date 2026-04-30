import type { MigrationDescriptor } from '../value-objects';
/**
 * Читатель SQL файлов миграций
 *
 * @remarks
 * VO для чтения SQL файлов из файловой системы.
 */
export declare class MigrationSqlReader {
    private readonly migrationsBaseDir;
    constructor(migrationsBaseDir: string);
    /**
     * Читает SQL файл миграции
     *
     * @param descriptor - Дескриптор миграции
     * @returns Содержимое SQL файла
     */
    read(descriptor: MigrationDescriptor): string;
    /**
     * Получает директорию категории
     *
     * @param category - Категория
     * @returns Путь к директории
     */
    private getCategoryDir;
}
