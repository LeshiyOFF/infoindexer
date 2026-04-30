"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEGACY_MIGRATION_DESCRIPTORS = void 0;
const value_objects_1 = require("../../value-objects");
/**
 * Legacy дескрипторы миграций
 *
 * @remarks
 * Массив с описанием миграций 000-016.
 * Используется как fallback при отсутствии файлов в ФС.
 */
exports.LEGACY_MIGRATION_DESCRIPTORS = [
    // ═══════════════════════════════════════════════════════════════════
    // PHASE 0: Инициализация системы миграций (ПЕРВОЙ!)
    // ═══════════════════════════════════════════════════════════════════
    (0, value_objects_1.createMigrationDescriptor)('000', '000_init_schema_migrations.sql', 'Initialize schema_migrations table with category support', 'shared'),
    // ═══════════════════════════════════════════════════════════════════
    // PHASE 1: Создание базовых таблиц
    // ═══════════════════════════════════════════════════════════════════
    (0, value_objects_1.createMigrationDescriptor)('000', '000_create_sync_checkpoints.sql', 'Create sync_checkpoints table for resume support', 'sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('001', '001_financial_reports_replacingmerge.sql', 'ReplacingMergeTree для financial_reports', 'sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('005', '005_exemption_criteria_enum.sql', 'exemption_criteria Enum8 type safety', 'sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('006', '006_geocoding_quality_string.sql', 'geocoding_quality LowCardinality(String) type fix', 'sync-worker'),
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
    (0, value_objects_1.createMigrationDescriptor)('014', '014_cleanup_egrul_data.sql', 'Cleanup EGRUL data for Three MV Pattern approach (Clean Slate)', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('015', '015_refactor_egrul_schema_for_mv.sql', 'Refactor EGRUL schema for Three MV Pattern (Variant B)', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('016', '016_add_staging_tables.sql', 'Add staging tables for FTM raw data (Staging + Transform pattern)', 'egrul-sync-worker'),
    (0, value_objects_1.createMigrationDescriptor)('001', '001_create_companies_meta.sql', 'Create Base companies_meta Table', 'shared'),
    (0, value_objects_1.createMigrationDescriptor)('002', '002_create_summary_view.sql', 'Create Read View for Financial Reports Summary', 'shared'),
    (0, value_objects_1.createMigrationDescriptor)('003', '003_create_companies_meta_sync_trigger.sql', 'Companies Meta Sync Mechanism', 'shared'),
    (0, value_objects_1.createMigrationDescriptor)('004', '004_update_summary_checker.sql', 'Update Summary Checker for View + MV compatibility', 'shared'),
    (0, value_objects_1.createMigrationDescriptor)('002', '002_add_ttl.sql', 'TTL для автоудаления старых данных', 'sync-worker'),
];
