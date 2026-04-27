/**
 * Migration Value Objects Index
 *
 * @remarks
 * Экспортирует все Value Objects модуля миграций.
 */
export { createMigrationDescriptor } from './migration-descriptor.vo';
// MigrationResult импортируется из ports/i-migration-runner.port.ts
export { createSuccessResult, createFailureResult } from './migration-result.vo';
export { createInitialStats, updateStats, mergeStats } from './migration-stats.vo';
