"use strict";
/**
 * Unified Migration Service
 *
 * @remarks
 * Domain Service: координирует применение ВСЕХ миграций.
 * Следует SRP: ответственен только за координацию.
 * Следует DIP: зависит от IMigrationRunner port.
 * Следует DRY: использует единый метод applyMigration.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedMigrationService = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const value_objects_1 = require("../value-objects");
/**
 * Дескрипторы всех миграций
 *
 * @remarks
 * Readonly массив с описанием всех миграций.
 * Порядок важен: сначала создаются таблицы, потом MV/Views которые от них зависят.
 */
const MIGRATION_DESCRIPTORS = [
    // ═══════════════════════════════════════════════════════════════════
    // PHASE 0: Инициализация системы миграций (ПЕРВОЙ!)
    // ═══════════════════════════════════════════════════════════════════
    // Shared - schema_migrations table
    (0, value_objects_1.createMigrationDescriptor)('000', '000_init_schema_migrations.sql', 'Initialize schema_migrations table with category support', 'shared'),
    // ═══════════════════════════════════════════════════════════════════
    // PHASE 1: Создание базовых таблиц
    // ═══════════════════════════════════════════════════════════════════
    // Sync worker - базовые таблицы
    (0, value_objects_1.createMigrationDescriptor)('000', '000_create_sync_checkpoints.sql', 'Create sync_checkpoints table for resume support', 'sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('001', '001_financial_reports_replacingmerge.sql', 'ReplacingMergeTree для financial_reports', 'sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('005', '005_exemption_criteria_enum.sql', 'exemption_criteria Enum8 type safety', 'sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('006', '006_geocoding_quality_string.sql', 'geocoding_quality LowCardinality(String) type fix', 'sync-worker'),
    // EGRUL sync worker - базовые таблицы
    (0, value_objects_1.createMigrationDescriptor)('001', '001_create_resume_states.sql', 'Create resume_states table for HTTP Range resume', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('002', '002_create_company_sanctions.sql', 'Create company_sanctions table', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('003', '003_create_companies_meta.sql', 'Create companies_meta table', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('004', '004_create_egrul_raw_tables.sql', 'Create EGRUL raw tables for import', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('005', '005_create_identity_mapping.sql', 'Create identity_mapping table', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('006', '006_create_denormalized_relations.sql', 'Create denormalized relations tables', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('007', '007_add_normalized_inn_columns.sql', 'Add normalized INN columns', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('008', '008_add_temporal_columns.sql', 'Add temporal columns to raw tables', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('009', '009_create_sync_state.sql', 'Create sync state table for incremental updates', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('010', '010_add_identity_projections.sql', 'Add projections and skipping indexes for identity_mapping', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('011', '011_alter_temporal_columns_to_datetime64.sql', 'Convert temporal columns to DateTime64(3, UTC)', 'egrul-sync-worker'),
    // ═══════════════════════════════════════════════════════════════════
    // PHASE 1.5: Cleanup перед внедрением Three MV Pattern
    // ═══════════════════════════════════════════════════════════════════
    (0, value_objects_1.createMigrationDescriptor)('014', '014_cleanup_egrul_data.sql', 'Cleanup EGRUL data for Three MV Pattern approach (Clean Slate)', 'egrul-sync-worker'),
    // ═══════════════════════════════════════════════════════════════════
    // PHASE 2: Schema Refactor + Three MV Pattern
    // ═══════════════════════════════════════════════════════════════════
    (0, value_objects_1.createMigrationDescriptor)('015', '015_refactor_egrul_schema_for_mv.sql', 'Refactor EGRUL schema for Three MV Pattern (Variant B)', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('016', '016_add_staging_tables.sql', 'Add staging tables for FTM raw data (Staging + Transform pattern)', 'egrul-sync-worker'),
    // ═══════════════════════════════════════════════════════════════════
    // PHASE 2: Создание MV и Views (зависят от базовых таблиц)
    // ═══════════════════════════════════════════════════════════════════
    (0, value_objects_1.createMigrationDescriptor)('001', '001_create_materialized_view.sql', 'Create Materialized View for Financial Reports Summary', 'shared'),
    (0, value_objects_1.createMigrationDescriptor)('002', '002_create_summary_view.sql', 'Create Read View for Financial Reports Summary', 'shared'),
    (0, value_objects_1.createMigrationDescriptor)('003', '003_create_companies_meta_sync_trigger.sql', 'Companies Meta Sync Mechanism', 'shared'),
    (0, value_objects_1.createMigrationDescriptor)('004', '004_update_summary_checker.sql', 'Update Summary Checker for View + MV compatibility', 'shared'),
    // ═══════════════════════════════════════════════════════════════════
    // PHASE 3: TTL (зависит от существования таблиц и views)
    // ═══════════════════════════════════════════════════════════════════
    (0, value_objects_1.createMigrationDescriptor)('002', '002_add_ttl.sql', 'TTL для автоудаления старых данных', 'sync-worker'),
];
/**
 * Unified Migration Service
 *
 * @remarks
 * Domain Service для координации применения всех миграций.
 * Читает SQL файлы и применяет их через IMigrationRunner.
 */
class UnifiedMigrationService {
    descriptors;
    params;
    constructor(params) {
        this.params = params;
        this.descriptors = this.sortByVersion(MIGRATION_DESCRIPTORS);
    }
    /**
     * Применяет все миграции
     *
     * @returns Статистика выполнения
     * @throws {Error} если какая-либо миграция не применяется
     *
     * @remarks
     * - Применяет миграции по порядку версий
     * - Пропускает уже применённые миграции
     * - Собирает статистику
     */
    async applyAll() {
        console.log('--- CHECKING MIGRATIONS ---');
        let stats = (0, value_objects_1.createInitialStats)();
        for (const descriptor of this.descriptors) {
            const result = await this.applyMigration(descriptor);
            stats = (0, value_objects_1.updateStats)(stats, result);
            if (!result.success && !result.skipped) {
                console.error('Migration failed:', descriptor.version, result.error);
                throw new Error(`Migration ${descriptor.version} failed: ${result.error}`);
            }
        }
        console.log('--- MIGRATIONS COMPLETED ---');
        console.log(`Total: ${stats.total}, Applied: ${stats.applied}, Skipped: ${stats.skipped}, Failed: ${stats.failed}, Duration: ${stats.durationMs}ms`);
        return stats;
    }
    /**
     * Получает список всех дескрипторов миграций
     *
     * @returns Readonly массив дескрипторов
     */
    getDescriptors() {
        return this.descriptors;
    }
    /**
     * Применяет одну миграцию
     *
     * @param descriptor - Дескриптор миграции
     * @returns Результат применения
     *
     * @remarks
     * DRY compliance: единый метод для применения всех миграций.
     */
    async applyMigration(descriptor) {
        const startTime = Date.now();
        try {
            // Проверяем что миграция ещё не применена
            const isApplied = await this.params.migrationRunner.isApplied(descriptor.category, descriptor.version);
            if (isApplied) {
                console.log(`Migration ${descriptor.category}/${descriptor.version} already applied, skipping`);
                return {
                    success: true,
                    skipped: true,
                    durationMs: Date.now() - startTime
                };
            }
            // Читаем SQL файл
            const sql = this.readMigrationFile(descriptor);
            // Применяем миграцию
            const result = await this.params.migrationRunner.apply(sql, {
                category: descriptor.category,
                version: descriptor.version,
                description: descriptor.description
            });
            if (!result.success) {
                return {
                    success: false,
                    skipped: false,
                    durationMs: result.durationMs,
                    error: result.error
                };
            }
            console.log(`Migration ${descriptor.category}/${descriptor.version} applied successfully in ${result.durationMs}ms`);
            return {
                success: true,
                skipped: false,
                durationMs: result.durationMs
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                skipped: false,
                durationMs: Date.now() - startTime,
                error: errorMessage
            };
        }
    }
    /**
     * Читает SQL файл миграции
     *
     * @param descriptor - Дескриптор миграции
     * @returns Содержимое SQL файла
     */
    readMigrationFile(descriptor) {
        const categoryDir = this.getCategoryDir(descriptor.category);
        const migrationPath = (0, path_1.join)(this.params.migrationsBaseDir, categoryDir, descriptor.file);
        return (0, fs_1.readFileSync)(migrationPath, 'utf-8');
    }
    /**
     * Получает директорию для категории миграции
     *
     * @param category - Категория миграции
     * @returns Имя директории
     */
    getCategoryDir(category) {
        switch (category) {
            case 'shared':
                return 'shared';
            case 'sync-worker':
                return 'sync-worker';
            case 'egrul-sync-worker':
                return 'egrul-sync-worker';
        }
    }
    /**
     * Сортирует дескрипторы по версии
     *
     * @param descriptors - Дескрипторы для сортировки
     * @returns Отсортированные дескрипторы
     */
    sortByVersion(descriptors) {
        return [...descriptors].sort((a, b) => {
            const versionA = parseInt(a.version, 10);
            const versionB = parseInt(b.version, 10);
            return versionA - versionB;
        });
    }
}
exports.UnifiedMigrationService = UnifiedMigrationService;
