"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationDiscovererService = void 0;
/**
 * Migration Discoverer Service
 *
 * @remarks
 * Сервис для обнаружения миграций из файловой системы.
 * Реализует IMigrationDiscoverer port.
 *
 * v2.1: Вынесен из UnifiedMigrationService для соблюдения SRP.
 *
 * @pattern Single Responsibility Principle (только обнаружение)
 * @pattern Dependency Inversion Principle (зависит от MetadataParser)
 */
const fs_1 = require("fs");
const path_1 = require("path");
const legacy_1 = require("./legacy");
/**
 * Категории миграций для сканирования
 */
const MIGRATION_CATEGORIES = [
    'shared',
    'sync-worker',
    'egrul-sync-worker'
];
/**
 * Порядок категорий для вторичной сортировки (при равных версиях)
 *
 * @remarks
 * Shared миграции должны идти первыми, затем app-specific.
 * Это гарантирует что shared инфраструктура готова до запуска domain логики.
 */
const CATEGORY_ORDER = {
    'shared': 0,
    'sync-worker': 1,
    'egrul-sync-worker': 2
};
/**
 * Сервис обнаружения миграций
 *
 * @remarks
 * Отвечает только за сканирование файловой системы
 * и построение дескрипторов миграций.
 */
class MigrationDiscovererService {
    metadataParser;
    migrationsBaseDir;
    categories = MIGRATION_CATEGORIES;
    constructor(metadataParser, migrationsBaseDir) {
        this.metadataParser = metadataParser;
        this.migrationsBaseDir = migrationsBaseDir;
    }
    /**
     * Обнаруживает все миграции
     *
     * @returns Отсортированный список дескрипторов
     */
    discover() {
        return this.discoverWithFallback();
    }
    /**
     * Обнаруживает с fallback на legacy
     *
     * @returns Отсортированные дескрипторы
     */
    discoverWithFallback() {
        const discovered = this.scanFilesystem();
        if (discovered.length === 0) {
            console.warn('[MigrationDiscoverer] No migrations discovered, using LEGACY fallback');
            return this.sortByVersion(legacy_1.LEGACY_MIGRATION_DESCRIPTORS);
        }
        console.log(`[MigrationDiscoverer] Discovered ${discovered.length} migrations`);
        return this.sortByVersion(discovered);
    }
    /**
     * Сканирует файловую систему
     *
     * @returns Дескрипторы из ФС
     */
    scanFilesystem() {
        const descriptors = [];
        for (const category of this.categories) {
            const categoryDescriptors = this.scanCategory(category);
            descriptors.push(...categoryDescriptors);
        }
        return descriptors;
    }
    /**
     * Сканирует категорию
     *
     * @param category - Категория миграции
     * @returns Дескрипторы категории
     */
    scanCategory(category) {
        const descriptors = [];
        const categoryDir = (0, path_1.join)(this.migrationsBaseDir, category);
        if (!(0, fs_1.existsSync)(categoryDir)) {
            return descriptors;
        }
        try {
            const files = this.listSqlFiles(categoryDir);
            for (const file of files) {
                const descriptor = this.parseFile(category, file);
                descriptors.push(descriptor);
            }
        }
        catch (error) {
            console.warn(`[MigrationDiscoverer] Failed to scan ${category}:`, error instanceof Error ? error.message : String(error));
        }
        return descriptors;
    }
    /**
     * Получает список SQL файлов
     *
     * @param dir - Директория
     * @returns Отсортированный список файлов
     */
    listSqlFiles(dir) {
        return (0, fs_1.readdirSync)(dir)
            .filter((file) => /^\d{3}_.+\.sql$/.test(file))
            .sort();
    }
    /**
     * Парсит файл миграции
     *
     * @param category - Категория
     * @param filename - Имя файла
     * @returns Дескриптор миграции
     */
    parseFile(category, filename) {
        const filepath = (0, path_1.join)(this.migrationsBaseDir, category, filename);
        const content = (0, fs_1.readFileSync)(filepath, 'utf-8');
        const metadata = this.metadataParser.parse(content, filename);
        const version = this.extractVersion(filename);
        return {
            version,
            file: filename,
            description: metadata.description,
            category
        };
    }
    /**
     * Извлекает версию из имени файла
     *
     * @param filename - Имя файла
     * @returns Версия
     */
    extractVersion(filename) {
        return filename.split('_')[0];
    }
    /**
     * Сортирует дескрипторы по версии и категории
     *
     * @remarks
     * Двухуровневая сортировка:
     * 1. По версии (числовой префикс)
     * 2. При равных версиях — по категории (shared → sync-worker → egrul-sync-worker)
     *
     * Это гарантирует предсказуемый порядок миграций и решает проблему
     * cross-service зависимостей (например, shared/001 зависит от sync-worker/001).
     *
     * @param descriptors - Дескрипторы
     * @returns Отсортированные дескрипторы
     */
    sortByVersion(descriptors) {
        return [...descriptors].sort((a, b) => {
            const versionA = parseInt(a.version, 10);
            const versionB = parseInt(b.version, 10);
            // Первичная сортировка по версии
            if (versionA !== versionB) {
                return versionA - versionB;
            }
            // Вторичная сортировка по категории (детерминированный порядок)
            return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
        });
    }
}
exports.MigrationDiscovererService = MigrationDiscovererService;
