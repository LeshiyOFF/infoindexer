/**
 * Экспорт всех ports
 */

export { IParquetReader, type DescribeResult } from './i-parquet-reader.port';
export { IClickHouseStorage } from './i-ch-storage.port';
export { IProgressReporter } from './i-progress-reporter.port';
export { IMessageBus, type MessageHandler } from './i-message-bus.port';
export { ICheckpointStorage, type CheckpointData } from './i-checkpoint-storage.port';
export { IMigrationRunner, type MigrationResult, type MigrationOptions } from './i-migration-runner.port';
