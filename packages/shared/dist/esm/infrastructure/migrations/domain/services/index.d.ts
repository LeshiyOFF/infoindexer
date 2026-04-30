/**
 * Migration Domain Services Index
 *
 * @remarks
 * Экспортирует все Domain Services модуля миграций.
 */
export type { UnifiedMigrationServiceParams } from './unified-migration.service';
export { UnifiedMigrationService } from './unified-migration.service';
export { MigrationDiscovererService } from './migration-discoverer.service';
export { MigrationApplierService } from './migration-applier.service';
export { LEGACY_MIGRATION_DESCRIPTORS } from './legacy/legacy-migration-descriptors';
export * from './parsers';
