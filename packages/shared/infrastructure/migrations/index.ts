/**
 * Unified Migration Module Index
 *
 * @remarks
 * Экспортирует все публичные API модуля миграций.
 */

// Ports
export * from './ports';

// Domain
export * from './domain';

// Adapters
export * from './adapters';

// Factories
export type {
  UnifiedMigrationFactoryParams
} from './factories/unified-migration.factory';

export {
  createUnifiedMigrationOrchestrator,
  createClickHouseMigrationAdapter,
  createUnifiedMigrationService
} from './factories/unified-migration.factory';
