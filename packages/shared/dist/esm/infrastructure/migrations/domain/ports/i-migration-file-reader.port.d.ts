/**
 * Port: IMigrationFileReader
 *
 * @remarks
 * Абстракция для чтения миграционных файлов из файловой системы.
 * Следует Hexagonal/Ports & Adapters pattern.
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Interface Segregation Principle
 */
import type { MigrationCategory } from '../value-objects';
/**
 * Результат чтения файла миграции
 *
 * @remarks
 * Value Object с readonly свойствами.
 */
export interface MigrationFileContent {
    /** Содержимое SQL файла */
    readonly content: string;
    /** Полный путь к файлу */
    readonly filepath: string;
}
/**
 * Port для чтения миграционных файлов
 *
 * @remarks
 * Определяет контракт для работы с файловой системой миграций.
 * Domain layer зависит от этой абстракции, не от конкретной реализации.
 *
 * @pattern Dependency Inversion Principle
 */
export interface IMigrationFileReader {
    /**
     * Получает список SQL файлов для категории
     *
     * @param category - Категория миграции
     * @returns Отсортированный список имён файлов
     *
     * @remarks
     * Возвращает файлы соответствующие маске: XXX_description.sql
     * Список должен быть отсортирован alphabetically (000, 001, ...)
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
}
