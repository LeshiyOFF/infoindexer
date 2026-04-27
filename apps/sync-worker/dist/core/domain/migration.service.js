"use strict";
/**
 * Сервис для применения миграций
 *
 * @remarks
 * Domain сервис для управления миграциями базы данных.
 * Следует SRP: отвечает за применение миграций при старте.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationService = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Сервис для применения миграций
 */
class MigrationService {
    migrationRunner;
    migrationsDir;
    constructor(migrationRunner, migrationsDir) {
        this.migrationRunner = migrationRunner;
        this.migrationsDir = migrationsDir;
    }
    /**
     * Применяет все миграции
     *
     * @remarks
     * Читает SQL файлы из директории миграций и применяет их по порядку.
     */
    async applyAll() {
        console.log('--- CHECKING MIGRATIONS ---');
        try {
            await this.applyCheckpointsMigration();
            await this.applyFinancialReportsMigration();
            await this.applyExemptionCriteriaEnumMigration();
            await this.applyGeocodingQualityStringMigration();
            console.log('--- MIGRATIONS COMPLETED ---');
        }
        catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }
    /**
     * Применяет миграцию sync_checkpoints
     */
    async applyCheckpointsMigration() {
        const migrationPath = (0, path_1.join)(this.migrationsDir, '000_create_sync_checkpoints.sql');
        const sql = (0, fs_1.readFileSync)(migrationPath, 'utf-8');
        const result = await this.migrationRunner.apply(sql, {
            version: '000',
            description: 'Create sync_checkpoints table'
        });
        if (result.success) {
            console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
        }
        else {
            throw new Error(`Migration ${result.version} failed: ${result.error}`);
        }
    }
    /**
     * Убеждается что таблица миграций существует
     */
    async ensureTable() {
        // Таблица создается автоматически в ClickHouseMigrationAdapter
    }
    /**
     * Применяет миграцию financial_reports ReplacingMergeTree
     */
    async applyFinancialReportsMigration() {
        const migrationPath = (0, path_1.join)(this.migrationsDir, '001_financial_reports_replacingmerge.sql');
        const sql = (0, fs_1.readFileSync)(migrationPath, 'utf-8');
        const result = await this.migrationRunner.apply(sql, {
            version: '001',
            description: 'ReplacingMergeTree для financial_reports'
        });
        if (result.success) {
            console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
        }
        else {
            throw new Error(`Migration ${result.version} failed: ${result.error}`);
        }
    }
    /**
     * Применяет миграцию TTL для автоудаления
     */
    async applyTtlMigration() {
        const migrationPath = (0, path_1.join)(this.migrationsDir, '002_add_ttl.sql');
        const sql = (0, fs_1.readFileSync)(migrationPath, 'utf-8');
        const result = await this.migrationRunner.apply(sql, {
            version: '002',
            description: 'TTL для автоудаления старых данных'
        });
        if (result.success) {
            console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
        }
        else {
            throw new Error(`Migration ${result.version} failed: ${result.error}`);
        }
    }
    /**
     * Применяет миграцию exemption_criteria Enum8
     */
    async applyExemptionCriteriaEnumMigration() {
        const migrationPath = (0, path_1.join)(this.migrationsDir, '005_exemption_criteria_enum.sql');
        const sql = (0, fs_1.readFileSync)(migrationPath, 'utf-8');
        const result = await this.migrationRunner.apply(sql, {
            version: '005',
            description: 'exemption_criteria Enum8 type safety'
        });
        if (result.success) {
            console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
        }
        else {
            throw new Error(`Migration ${result.version} failed: ${result.error}`);
        }
    }
    /**
     * Применяет миграцию geocoding_quality LowCardinality(String)
     */
    async applyGeocodingQualityStringMigration() {
        const migrationPath = (0, path_1.join)(this.migrationsDir, '006_geocoding_quality_string.sql');
        const sql = (0, fs_1.readFileSync)(migrationPath, 'utf-8');
        const result = await this.migrationRunner.apply(sql, {
            version: '006',
            description: 'geocoding_quality LowCardinality(String) type fix'
        });
        if (result.success) {
            console.log(`Migration ${result.version} applied successfully in ${result.durationMs}ms`);
        }
        else {
            throw new Error(`Migration ${result.version} failed: ${result.error}`);
        }
    }
}
exports.MigrationService = MigrationService;
