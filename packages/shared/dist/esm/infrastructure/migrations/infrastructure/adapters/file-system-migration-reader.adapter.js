"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemMigrationReaderAdapter = void 0;
/**
 * File System Migration Reader Adapter
 *
 * @remarks
 * Реализация IMigrationFileReader для Node.js файловой системы.
 * Следует Adapter pattern из Hexagonal Architecture.
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Single Responsibility Principle
 */
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Адаптер для чтения миграционных файлов из файловой системы
 *
 * @remarks
 * Реализует Port IMigrationFileReader используя Node.js fs API.
 * Отвечает только за работу с файловой системой.
 */
class FileSystemMigrationReaderAdapter {
    migrationsBaseDir;
    categoryDirs;
    constructor(params) {
        this.migrationsBaseDir = params.migrationsBaseDir;
        this.categoryDirs = params.categoryDirs ?? this.getDefaultCategoryDirs();
    }
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
    async listFiles(category) {
        const categoryDir = this.getCategoryDir(category);
        if (!(0, fs_1.existsSync)(categoryDir)) {
            return [];
        }
        const files = (0, fs_1.readdirSync)(categoryDir)
            .filter(file => this.isValidMigrationFile(file))
            .sort(); // Alphabetical sort = chronological for zero-padded numbers
        return files;
    }
    /**
     * Читает содержимое файла миграции
     *
     * @param category - Категория миграции
     * @param filename - Имя файла
     * @returns Содержимое файла и путь
     * @throws {Error} если файл не существует
     */
    async readFile(category, filename) {
        const filepath = this.getFilepath(category, filename);
        if (!(0, fs_1.existsSync)(filepath)) {
            throw new Error(`Migration file not found: ${filepath}`);
        }
        const content = (0, fs_1.readFileSync)(filepath, 'utf-8');
        return {
            content,
            filepath
        };
    }
    /**
     * Проверяет существование файла
     *
     * @param category - Категория миграции
     * @param filename - Имя файла
     * @returns true если файл существует
     */
    async exists(category, filename) {
        const filepath = this.getFilepath(category, filename);
        return (0, fs_1.existsSync)(filepath);
    }
    /**
     * Проверяет валидность имени файла миграции
     *
     * @param filename - Имя файла
     * @returns true если соответствует маске XXX_description.sql
     *
     * @remarks
     * Маска: три цифры, подчёркивание, описание, .sql
     */
    isValidMigrationFile(filename) {
        return /^\d{3}_.+\.sql$/.test(filename);
    }
    /**
     * Получает полный путь к файлу
     *
     * @param category - Категория миграции
     * @param filename - Имя файла
     * @returns Полный путь
     */
    getFilepath(category, filename) {
        const categoryDir = this.getCategoryDir(category);
        return (0, path_1.join)(categoryDir, filename);
    }
    /**
     * Получает директорию для категории
     *
     * @param category - Категория миграции
     * @returns Полный путь к директории
     */
    getCategoryDir(category) {
        const subdir = this.categoryDirs[category];
        return (0, path_1.join)(this.migrationsBaseDir, subdir);
    }
    /**
     * Получает соответствие категорий к директориям по умолчанию
     *
     * @returns Соответствие категорий
     */
    getDefaultCategoryDirs() {
        return {
            shared: 'shared',
            'sync-worker': 'sync-worker',
            'egrul-sync-worker': 'egrul-sync-worker'
        };
    }
}
exports.FileSystemMigrationReaderAdapter = FileSystemMigrationReaderAdapter;
