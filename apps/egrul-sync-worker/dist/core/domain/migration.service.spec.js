"use strict";
/**
 * Спецификация для MigrationService
 *
 * @remarks
 * Проверяет структуру дескрипторов миграций.
 * Следует AAA pattern: Arrange, Act, Assert.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs_1 = require("fs");
const path_1 = require("path");
/** Массив версий миграций для валидации */
const MIGRATION_VERSIONS = [
    '001', '002', '003', '004', '005', '006', '007', '008', '009', '010'
];
/** Дескриптор миграции 010 для тестирования */
const MIGRATION_010 = {
    version: '010',
    file: '010_add_identity_projections.sql',
    description: 'Add projections and skipping indexes for identity_mapping optimization'
};
(0, vitest_1.describe)('MigrationService', () => {
    (0, vitest_1.describe)('migrations array', () => {
        (0, vitest_1.it)('should have 10 migrations', () => {
            (0, vitest_1.expect)(MIGRATION_VERSIONS).toHaveLength(10);
        });
        (0, vitest_1.it)('should have sequential version numbers', () => {
            (0, vitest_1.expect)(MIGRATION_VERSIONS).toEqual([
                '001', '002', '003', '004', '005',
                '006', '007', '008', '009', '010'
            ]);
        });
        (0, vitest_1.it)('should have unique version numbers', () => {
            const uniqueVersions = new Set(MIGRATION_VERSIONS);
            (0, vitest_1.expect)(uniqueVersions.size).toBe(MIGRATION_VERSIONS.length);
        });
    });
    (0, vitest_1.describe)('migration 010', () => {
        (0, vitest_1.it)('should have correct descriptor', () => {
            (0, vitest_1.expect)(MIGRATION_010.version).toBe('010');
            (0, vitest_1.expect)(MIGRATION_010.file).toBe('010_add_identity_projections.sql');
            (0, vitest_1.expect)(MIGRATION_010.description.length).toBeGreaterThan(10);
        });
        (0, vitest_1.it)('should have valid filename format', () => {
            (0, vitest_1.expect)(MIGRATION_010.file).toMatch(/^\d{3}_[a-z_]+\.sql$/);
        });
    });
});
(0, vitest_1.describe)('Migration 010 File Content', () => {
    const migrationsDir = (0, path_1.join)(__dirname, '../infrastructure/migrations');
    (0, vitest_1.describe)('structure', () => {
        (0, vitest_1.it)('should be readable', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            (0, vitest_1.expect)(() => (0, fs_1.readFileSync)(filePath, 'utf-8')).not.toThrow();
        });
        (0, vitest_1.it)('should contain PROJECTION definition', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toContain('ADD PROJECTION IF NOT EXISTS pk_by_entity_type');
        });
        (0, vitest_1.it)('should contain id_type bloom filter index', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toContain('ADD INDEX IF NOT EXISTS idx_id_type_bloom');
            (0, vitest_1.expect)(content).toContain('TYPE bloom_filter');
        });
        (0, vitest_1.it)('should contain entity_type bloom filter index', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toContain('ADD INDEX IF NOT EXISTS idx_entity_type_bloom');
            (0, vitest_1.expect)(content).toContain('TYPE bloom_filter');
        });
        (0, vitest_1.it)('should use correct table name', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toContain('egrul_identity_mapping');
        });
        (0, vitest_1.it)('should have proper ORDER BY in projection', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toContain('ORDER BY (entity_type, id_type, raw_id)');
        });
        (0, vitest_1.it)('should use GRANULARITY 1 for indexes', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toMatch(/GRANULARITY 1/g);
        });
        (0, vitest_1.it)('should use bloom_filter(0.01) for indexes', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toContain('bloom_filter(0.01)');
        });
    });
    (0, vitest_1.describe)('documentation', () => {
        (0, vitest_1.it)('should have header comment with purpose', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toMatch(/-- Migration 010:/);
            (0, vitest_1.expect)(content).toMatch(/-- Purpose:/);
        });
        (0, vitest_1.it)('should have Architecture section', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toMatch(/-- Architecture:/);
        });
        (0, vitest_1.it)('should have SRP comments', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toContain('-- SRP:');
        });
        (0, vitest_1.it)('should have DRY comments', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toContain('-- DRY:');
        });
        (0, vitest_1.it)('should have OCP comments', () => {
            const filePath = (0, path_1.join)(migrationsDir, '010_add_identity_projections.sql');
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            (0, vitest_1.expect)(content).toContain('-- OCP:');
        });
    });
});
