/**
 * Unified Migration Module Index
 *
 * @remarks
 * Экспортирует все публичные API модуля миграций.
 */
export * from './ports';
export * from './domain';
export * from './adapters';
export type { UnifiedMigrationFactoryParams } from './factories/unified-migration.factory';
export { createUnifiedMigrationOrchestrator, createClickHouseMigrationAdapter, createUnifiedMigrationService } from './factories/unified-migration.factory';
