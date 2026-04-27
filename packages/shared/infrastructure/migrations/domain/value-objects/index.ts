/**
 * Migration Value Objects Index
 *
 * @remarks
 * Экспортирует все Value Objects модуля миграций.
 */

export type {
  MigrationCategory,
  MigrationDescriptor
} from './migration-descriptor.vo';

export {
  createMigrationDescriptor
} from './migration-descriptor.vo';

// MigrationResult импортируется из ports/i-migration-runner.port.ts
export {
  createSuccessResult,
  createFailureResult
} from './migration-result.vo';

export type {
  MigrationStats
} from './migration-stats.vo';

export {
  createInitialStats,
  updateStats,
  mergeStats
} from './migration-stats.vo';
