"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationSqlReader = void 0;
/**
 * Migration SQL Reader
 *
 * @remarks
 * Value Object для чтения SQL файлов миграций.
 * Вынесен из MigrationApplierService для соблюдения лимита строк.
 *
 * @pattern Value Object
 * @pattern Single Responsibility Principle
 */
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Читатель SQL файлов миграций
 *
 * @remarks
 * VO для чтения SQL файлов из файловой системы.
 */
class MigrationSqlReader {
    migrationsBaseDir;
    constructor(migrationsBaseDir) {
        this.migrationsBaseDir = migrationsBaseDir;
    }
    /**
     * Читает SQL файл миграции
     *
     * @param descriptor - Дескриптор миграции
     * @returns Содержимое SQL файла
     */
    read(descriptor) {
        const categoryDir = this.getCategoryDir(descriptor.category);
        const filepath = (0, path_1.join)(categoryDir, descriptor.file);
        return (0, fs_1.readFileSync)(filepath, 'utf-8');
    }
    /**
     * Получает директорию категории
     *
     * @param category - Категория
     * @returns Путь к директории
     */
    getCategoryDir(category) {
        return (0, path_1.join)(this.migrationsBaseDir, category);
    }
}
exports.MigrationSqlReader = MigrationSqlReader;
