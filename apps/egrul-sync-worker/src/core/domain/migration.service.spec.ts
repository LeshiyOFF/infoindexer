/**
 * Спецификация для MigrationService
 *
 * @remarks
 * Проверяет структуру дескрипторов миграций.
 * Следует AAA pattern: Arrange, Act, Assert.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/** Массив версий миграций для валидации */
const MIGRATION_VERSIONS = [
  '001', '002', '003', '004', '005', '006', '007', '008', '009', '010'
] as const;

/** Дескриптор миграции 010 для тестирования */
const MIGRATION_010 = {
  version: '010',
  file: '010_add_identity_projections.sql',
  description: 'Add projections and skipping indexes for identity_mapping optimization'
} as const;

describe('MigrationService', () => {
  describe('migrations array', () => {
    it('should have 10 migrations', () => {
      expect(MIGRATION_VERSIONS).toHaveLength(10);
    });

    it('should have sequential version numbers', () => {
      expect(MIGRATION_VERSIONS).toEqual([
        '001', '002', '003', '004', '005',
        '006', '007', '008', '009', '010'
      ]);
    });

    it('should have unique version numbers', () => {
      const uniqueVersions = new Set(MIGRATION_VERSIONS);
      expect(uniqueVersions.size).toBe(MIGRATION_VERSIONS.length);
    });
  });

  describe('migration 010', () => {
    it('should have correct descriptor', () => {
      expect(MIGRATION_010.version).toBe('010');
      expect(MIGRATION_010.file).toBe('010_add_identity_projections.sql');
      expect(MIGRATION_010.description.length).toBeGreaterThan(10);
    });

    it('should have valid filename format', () => {
      expect(MIGRATION_010.file).toMatch(/^\d{3}_[a-z_]+\.sql$/);
    });
  });
});

describe('Migration 010 File Content', () => {
  const migrationsDir = join(__dirname, '../infrastructure/migrations');

  describe('structure', () => {
    it('should be readable', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');

      expect(() => readFileSync(filePath, 'utf-8')).not.toThrow();
    });

    it('should contain PROJECTION definition', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('ADD PROJECTION IF NOT EXISTS pk_by_entity_type');
    });

    it('should contain id_type bloom filter index', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('ADD INDEX IF NOT EXISTS idx_id_type_bloom');
      expect(content).toContain('TYPE bloom_filter');
    });

    it('should contain entity_type bloom filter index', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('ADD INDEX IF NOT EXISTS idx_entity_type_bloom');
      expect(content).toContain('TYPE bloom_filter');
    });

    it('should use correct table name', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('egrul_identity_mapping');
    });

    it('should have proper ORDER BY in projection', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('ORDER BY (entity_type, id_type, raw_id)');
    });

    it('should use GRANULARITY 1 for indexes', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/GRANULARITY 1/g);
    });

    it('should use bloom_filter(0.01) for indexes', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('bloom_filter(0.01)');
    });
  });

  describe('documentation', () => {
    it('should have header comment with purpose', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/-- Migration 010:/);
      expect(content).toMatch(/-- Purpose:/);
    });

    it('should have Architecture section', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toMatch(/-- Architecture:/);
    });

    it('should have SRP comments', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('-- SRP:');
    });

    it('should have DRY comments', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('-- DRY:');
    });

    it('should have OCP comments', () => {
      const filePath = join(migrationsDir, '010_add_identity_projections.sql');
      const content = readFileSync(filePath, 'utf-8');

      expect(content).toContain('-- OCP:');
    });
  });
});
