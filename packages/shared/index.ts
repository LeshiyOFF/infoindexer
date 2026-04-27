/**
 * Shared Package Exports
 */

// Core types
export * from './interfaces';

// Infrastructure clients
export * from './redis';
export * from './clickhouse';

// Domain Layer
export * from './domain';

// Result Type
export * from './result';

// Domain Errors
export * from './errors';

// API Types & Contracts (selective export to avoid conflicts)
export type {
  ApiError,
  Pagination
} from './api';
export {
  apiSuccess,
  apiError,
  apiPaginated,
  ApiErrorCode,
  SyncStage,
  createSyncStatus,
  calculateStagePercentage,
  DEFAULT_SYNC_CONFIG
} from './api';
export type {
  SyncStatus,
  SyncStatusData,
  SyncStatusResponse,
  StageProgress,
  StageResult,
  SyncConfig,
  GetSanctionsByInnRequest,
  GetSanctionsByInnResponse,
  GetSanctionsBatchRequest,
  GetSanctionsBatchResponse,
  GetSanctionsListRequest,
  GetSanctionsListResponse,
  SanctionStatsDTO,
  GetSanctionStatsResponse,
  DeleteSanctionsRequest,
  DeleteSanctionsResponse,
  CheckSanctionsRequest,
  CheckSanctionsResponse
} from './api';

// New discriminated union ApiResponse (import explicitly if needed)
export type { ApiResponse as ApiResultResponse, PaginatedResponse } from './api/responses';

// Repository Interfaces (Ports)
export * from './repositories';

// Services
// refreshFinancialSummary удалён в итерации 1 (заменён на Materialized View)
// Типы оставлены для обратной совместимости если кто-то использует
export type {
  RefreshProgressReporter,
  RefreshOptions,
  RefreshResult
} from './refresh-summary';

// Companies Meta Sync Worker (Iteration 1)
export { CompaniesMetaSyncWorker } from './infrastructure/workers/companies-meta-sync.worker';
export { createCompaniesMetaSyncWorker } from './infrastructure/factories/companies-meta-sync.factory';

// Circuit Breaker (Iteration 2: Production-ready implementation)
export * from './infrastructure/circuit-breaker';

// Legacy exports for backward compatibility (deprecated)
export { CircuitState as CircuitBreakerState } from './infrastructure/circuit-breaker/domain/types/circuit-breaker.types';
export { CircuitBreakerConfigVO as CircuitBreakerConfig } from './infrastructure/circuit-breaker/domain/value-objects/circuit-breaker-config.vo';
export type { ICircuitBreakerPort as ICircuitBreaker } from './infrastructure/circuit-breaker/ports/i-circuit-breaker.port';
export { CircuitBreakerAdapter as ConsoleCircuitBreaker } from './infrastructure/circuit-breaker/adapters/circuit-breaker.adapter';

// Query Metrics (Iteration 1)
export type {
  IQueryMetricsCollector,
  QueryMetrics
} from './infrastructure/ports/i-query-metrics-collector.port';
export {
  ConsoleQueryMetricsCollector,
  createQueryMetricsService
} from './infrastructure/adapters/console-query-metrics.adapter';

// Migration Lock
export { MigrationLock, createMigrationLock } from './infrastructure/migration-lock.adapter';
export type { IMigrationLock, MigrationLockOptions } from './infrastructure/ports/i-migration-lock.port';

// Unified Migrations (Migration Worker)
export * from './infrastructure/migrations';

// ClickHouse Configuration (Iteration 7, 8, 9)
export { ClickHouseConfigAdapter, createClickHouseConfig } from './infrastructure/clickhouse-config.adapter';
export { createClickHouseConfigAsync } from './infrastructure/clickhouse-config-async.factory';
export { CLICKHOUSE_DEFAULTS } from './infrastructure/clickhouse.constants';
export type { IClickHouseConfig, ClickHouseSettings, TLSSettings } from './infrastructure/ports/i-clickhouse-config.port';

// ClickHouse Client (Iteration 10: Added factory function)
export { clickhouseClient, createClickHouseClient } from './clickhouse';

// Certificate Provider (Iteration 9.1: TLS Certificate Automation)
export {
  FileSystemCertificateProvider,
  createCertificateProvider
} from './infrastructure/file-certificate-provider.adapter';
export { CertificateGenerator } from './infrastructure/certificate-generator.service';
export type {
  ICertificateProvider,
  CertificateGenerationOptions
} from './infrastructure/ports/i-certificate-provider.port';

// Vault Certificate Provider (Iteration 11: Secrets Management)
export {
  VaultCertificateProvider,
  createVaultCertificateProvider
} from './infrastructure/vault-certificate-provider.adapter';
export type {
  VaultCertificateProviderOptions
} from './infrastructure/vault-certificate-provider.adapter';

// Logger (Iteration 10: RBAC + Config Validation)
export { createLogger, StructuredLoggerAdapter } from './infrastructure/structured-logger.adapter';
export { LogLevel } from './infrastructure/ports/i-logger.port';
export type {
  ILogger,
  LogContext,
  LoggerOptions
} from './infrastructure/ports/i-logger.port';

// RBAC (Iteration 10: RBAC + Users)
export {
  createClickHouseRBACAdapter,
  ClickHouseRBACAdapter
} from './infrastructure/clickhouse-rbac.adapter';
export {
  createClickHouseUsersService,
  ClickHouseUsersService
} from './infrastructure/clickhouse-users.service';
export type {
  IClickHouseRBACManager,
  ClickHouseUser,
  UserCreationResult,
  UserExistenceResult,
  UserInitConfig,
  UserInitResult
} from './infrastructure/ports/i-clickhouse-rbac.port';

// Config Validator (Iteration 10.2: Config Validation)
export {
  createClickHouseConfigValidator,
  ClickHouseConfigValidatorAdapter
} from './infrastructure/clickhouse-config-validator.adapter';
export type {
  IClickHouseConfigValidator,
  ConfigValidationResult,
  ConfigValidationCheck,
  ConfigValidationOptions
} from './infrastructure/ports/i-config-validator.port';

// Audit Logging (Iteration 12: Audit Logging)
export {
  createAuditLogger,
  createClickHouseAuditLogger,
  ClickHouseAuditLoggerAdapter,
  createConsoleAuditLogger,
  ConsoleAuditLoggerAdapter,
  AuditLoggerType
} from './infrastructure/audit-logger.factory';
export {
  createAuditLogDDL,
  AUDIT_LOG_DEFAULTS,
  validateTableName,
  validateDatabaseName
} from './infrastructure/audit-log-sql';
export {
  createAuditLogSelectByUser,
  createAuditLogSelectByResource,
  createAuditLogSelectByType,
  createAuditLogCountByUser,
  createAuditLogStats
} from './infrastructure/audit-log-queries';
export type {
  IAuditLogger,
  AuditLoggerResult,
  AuditLoggerOptions
} from './infrastructure/ports/i-audit-logger.port';

export * from './financial-reports';

// GDPR Deletion (Iteration 13)
export * from './domain/gdpr';
export { createGdprDeletionService } from './infrastructure/adapters/gdpr-deletion.factory';
export type { IGdprDeletion } from './infrastructure/ports/i-gdpr-deletion.port';

// Rate Limiting (Iteration 14)
export * from './domain/rate-limit';
export {
  createRateLimitService,
  createRateLimitServiceWithRedis
} from './infrastructure/adapters/rate-limit.factory';
export { RedisRateLimitAdapter } from './infrastructure/adapters/redis-rate-limit.adapter';
export type { IRateLimitPort, RateLimitCheckOptions } from './infrastructure/ports/i-rate-limit.port';

// Abort Operations
export type { IAbortHandler, AbortResult, AbortOperationType, AbortContext } from './infrastructure/ports/abort.port';
export { RedisAbortAdapter, ABORT_CHANNELS } from './infrastructure/adapters/redis-abort.adapter';
export {
  createAbortCommand,
  serializeAbortCommand,
  deserializeAbortCommand
} from './domain/abort/abort-command.dto';
export {
  abortSuccess,
  abortNotFound,
  abortFailed,
  isAbortSuccess,
  isAbortNotFound
} from './domain/abort/abort-result.vo';

// Resource-Aware Configuration (Iteration 6.5: Auto-tuning)
export * from './core';
export {
  CgroupResourceDiscoveryAdapter,
  OSResourceDiscoveryAdapter,
  ConfigProfileSelectorAdapter,
  StartupHealthCheckAdapter
} from './core/infrastructure/adapters';
export {
  ResourceCalculationService
} from './core/domain/services';
export {
  MemorySize,
  ConfigProfile
} from './core/domain/value-objects';
export { ConfigProfileType } from './core/domain/value-objects/config-profile-type.enum';
export { LOW, STANDARD, HIGH } from './core/domain/value-objects/config-profile.constants';
export { selectConfigProfile, getAllConfigProfiles } from './core/domain/value-objects/config-profile.utils';
export {
  ResourceInfo,
  ResourceSource
} from './core/domain/value-objects/resource-info.vo';
export type {
  IResourceDiscoveryPort,
  IConfigProfileSelectorPort,
  IStartupHealthCheckPort,
  HealthStatus,
  ConfigProfileData,
  ResourceInfoData,
  CalculatedConfig
} from './core';
