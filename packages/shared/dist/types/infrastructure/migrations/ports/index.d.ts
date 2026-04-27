/**
 * Migration Ports Index
 *
 * @remarks
 * Экспортирует все порты модуля миграций.
 */
export type { MigrationOrchestrationStats, IMigrationOrchestrator } from './i-migration-orchestrator.port';
export type { MigrationResult, MigrationOptions, IMigrationRunner } from './i-migration-runner.port';
export type { Lock, LockOptions, IDistributedLock } from './i-distributed-lock.port';
