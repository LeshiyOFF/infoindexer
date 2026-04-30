"use strict";
/**
 * Shared Package Exports
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLogSelectByType = exports.createAuditLogSelectByResource = exports.createAuditLogSelectByUser = exports.validateDatabaseName = exports.validateTableName = exports.AUDIT_LOG_DEFAULTS = exports.createAuditLogDDL = exports.AuditLoggerType = exports.ConsoleAuditLoggerAdapter = exports.createConsoleAuditLogger = exports.ClickHouseAuditLoggerAdapter = exports.createClickHouseAuditLogger = exports.createAuditLogger = exports.ClickHouseConfigValidatorAdapter = exports.createClickHouseConfigValidator = exports.ClickHouseUsersService = exports.createClickHouseUsersService = exports.ClickHouseRBACAdapter = exports.createClickHouseRBACAdapter = exports.LogLevel = exports.StructuredLoggerAdapter = exports.createLogger = exports.createVaultCertificateProvider = exports.VaultCertificateProvider = exports.CertificateGenerator = exports.createCertificateProvider = exports.FileSystemCertificateProvider = exports.createClickHouseClient = exports.clickhouseClient = exports.CLICKHOUSE_DEFAULTS = exports.createClickHouseConfigAsync = exports.createClickHouseConfig = exports.ClickHouseConfigAdapter = exports.createMigrationLock = exports.MigrationLock = exports.createQueryMetricsService = exports.ConsoleQueryMetricsCollector = exports.ConsoleCircuitBreaker = exports.CircuitBreakerConfig = exports.CircuitBreakerState = exports.createCompaniesMetaSyncWorker = exports.CompaniesMetaSyncWorker = exports.DEFAULT_SYNC_CONFIG = exports.calculateStagePercentage = exports.createSyncStatus = exports.SyncStage = exports.ApiErrorCode = exports.apiPaginated = exports.apiError = exports.apiSuccess = void 0;
exports.ResourceSource = exports.ResourceInfo = exports.getAllConfigProfiles = exports.selectConfigProfile = exports.HIGH = exports.STANDARD = exports.LOW = exports.ConfigProfileType = exports.ConfigProfile = exports.MemorySize = exports.ResourceCalculationService = exports.StartupHealthCheckAdapter = exports.ConfigProfileSelectorAdapter = exports.OSResourceDiscoveryAdapter = exports.CgroupResourceDiscoveryAdapter = exports.isAbortNotFound = exports.isAbortSuccess = exports.abortFailed = exports.abortNotFound = exports.abortSuccess = exports.deserializeAbortCommand = exports.serializeAbortCommand = exports.createAbortCommand = exports.ABORT_CHANNELS = exports.RedisAbortAdapter = exports.RedisRateLimitAdapter = exports.createRateLimitServiceWithRedis = exports.createRateLimitService = exports.createGdprDeletionService = exports.createAuditLogStats = exports.createAuditLogCountByUser = void 0;
// Core types
__exportStar(require("./interfaces"), exports);
// Infrastructure clients
__exportStar(require("./redis"), exports);
__exportStar(require("./clickhouse"), exports);
// Domain Layer
__exportStar(require("./domain"), exports);
// Result Type
__exportStar(require("./result"), exports);
// Domain Errors
__exportStar(require("./errors"), exports);
var api_1 = require("./api");
Object.defineProperty(exports, "apiSuccess", { enumerable: true, get: function () { return api_1.apiSuccess; } });
Object.defineProperty(exports, "apiError", { enumerable: true, get: function () { return api_1.apiError; } });
Object.defineProperty(exports, "apiPaginated", { enumerable: true, get: function () { return api_1.apiPaginated; } });
Object.defineProperty(exports, "ApiErrorCode", { enumerable: true, get: function () { return api_1.ApiErrorCode; } });
Object.defineProperty(exports, "SyncStage", { enumerable: true, get: function () { return api_1.SyncStage; } });
Object.defineProperty(exports, "createSyncStatus", { enumerable: true, get: function () { return api_1.createSyncStatus; } });
Object.defineProperty(exports, "calculateStagePercentage", { enumerable: true, get: function () { return api_1.calculateStagePercentage; } });
Object.defineProperty(exports, "DEFAULT_SYNC_CONFIG", { enumerable: true, get: function () { return api_1.DEFAULT_SYNC_CONFIG; } });
// Repository Interfaces (Ports)
__exportStar(require("./repositories"), exports);
// Companies Meta Sync Worker (Iteration 1)
var companies_meta_sync_worker_1 = require("./infrastructure/workers/companies-meta-sync.worker");
Object.defineProperty(exports, "CompaniesMetaSyncWorker", { enumerable: true, get: function () { return companies_meta_sync_worker_1.CompaniesMetaSyncWorker; } });
var companies_meta_sync_factory_1 = require("./infrastructure/factories/companies-meta-sync.factory");
Object.defineProperty(exports, "createCompaniesMetaSyncWorker", { enumerable: true, get: function () { return companies_meta_sync_factory_1.createCompaniesMetaSyncWorker; } });
// Circuit Breaker (Iteration 2: Production-ready implementation)
__exportStar(require("./infrastructure/circuit-breaker"), exports);
// Legacy exports for backward compatibility (deprecated)
var circuit_breaker_types_1 = require("./infrastructure/circuit-breaker/domain/types/circuit-breaker.types");
Object.defineProperty(exports, "CircuitBreakerState", { enumerable: true, get: function () { return circuit_breaker_types_1.CircuitState; } });
var circuit_breaker_config_vo_1 = require("./infrastructure/circuit-breaker/domain/value-objects/circuit-breaker-config.vo");
Object.defineProperty(exports, "CircuitBreakerConfig", { enumerable: true, get: function () { return circuit_breaker_config_vo_1.CircuitBreakerConfigVO; } });
var circuit_breaker_adapter_1 = require("./infrastructure/circuit-breaker/adapters/circuit-breaker.adapter");
Object.defineProperty(exports, "ConsoleCircuitBreaker", { enumerable: true, get: function () { return circuit_breaker_adapter_1.CircuitBreakerAdapter; } });
var console_query_metrics_adapter_1 = require("./infrastructure/adapters/console-query-metrics.adapter");
Object.defineProperty(exports, "ConsoleQueryMetricsCollector", { enumerable: true, get: function () { return console_query_metrics_adapter_1.ConsoleQueryMetricsCollector; } });
Object.defineProperty(exports, "createQueryMetricsService", { enumerable: true, get: function () { return console_query_metrics_adapter_1.createQueryMetricsService; } });
// Migration Lock
var migration_lock_adapter_1 = require("./infrastructure/migration-lock.adapter");
Object.defineProperty(exports, "MigrationLock", { enumerable: true, get: function () { return migration_lock_adapter_1.MigrationLock; } });
Object.defineProperty(exports, "createMigrationLock", { enumerable: true, get: function () { return migration_lock_adapter_1.createMigrationLock; } });
// Unified Migrations (Migration Worker)
__exportStar(require("./infrastructure/migrations"), exports);
// ClickHouse Configuration (Iteration 7, 8, 9)
var clickhouse_config_adapter_1 = require("./infrastructure/clickhouse-config.adapter");
Object.defineProperty(exports, "ClickHouseConfigAdapter", { enumerable: true, get: function () { return clickhouse_config_adapter_1.ClickHouseConfigAdapter; } });
Object.defineProperty(exports, "createClickHouseConfig", { enumerable: true, get: function () { return clickhouse_config_adapter_1.createClickHouseConfig; } });
var clickhouse_config_async_factory_1 = require("./infrastructure/clickhouse-config-async.factory");
Object.defineProperty(exports, "createClickHouseConfigAsync", { enumerable: true, get: function () { return clickhouse_config_async_factory_1.createClickHouseConfigAsync; } });
var clickhouse_constants_1 = require("./infrastructure/clickhouse.constants");
Object.defineProperty(exports, "CLICKHOUSE_DEFAULTS", { enumerable: true, get: function () { return clickhouse_constants_1.CLICKHOUSE_DEFAULTS; } });
// ClickHouse Client (Iteration 10: Added factory function)
var clickhouse_1 = require("./clickhouse");
Object.defineProperty(exports, "clickhouseClient", { enumerable: true, get: function () { return clickhouse_1.clickhouseClient; } });
Object.defineProperty(exports, "createClickHouseClient", { enumerable: true, get: function () { return clickhouse_1.createClickHouseClient; } });
// Certificate Provider (Iteration 9.1: TLS Certificate Automation)
var file_certificate_provider_adapter_1 = require("./infrastructure/file-certificate-provider.adapter");
Object.defineProperty(exports, "FileSystemCertificateProvider", { enumerable: true, get: function () { return file_certificate_provider_adapter_1.FileSystemCertificateProvider; } });
Object.defineProperty(exports, "createCertificateProvider", { enumerable: true, get: function () { return file_certificate_provider_adapter_1.createCertificateProvider; } });
var certificate_generator_service_1 = require("./infrastructure/certificate-generator.service");
Object.defineProperty(exports, "CertificateGenerator", { enumerable: true, get: function () { return certificate_generator_service_1.CertificateGenerator; } });
// Vault Certificate Provider (Iteration 11: Secrets Management)
var vault_certificate_provider_adapter_1 = require("./infrastructure/vault-certificate-provider.adapter");
Object.defineProperty(exports, "VaultCertificateProvider", { enumerable: true, get: function () { return vault_certificate_provider_adapter_1.VaultCertificateProvider; } });
Object.defineProperty(exports, "createVaultCertificateProvider", { enumerable: true, get: function () { return vault_certificate_provider_adapter_1.createVaultCertificateProvider; } });
// Logger (Iteration 10: RBAC + Config Validation)
var structured_logger_adapter_1 = require("./infrastructure/structured-logger.adapter");
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return structured_logger_adapter_1.createLogger; } });
Object.defineProperty(exports, "StructuredLoggerAdapter", { enumerable: true, get: function () { return structured_logger_adapter_1.StructuredLoggerAdapter; } });
var i_logger_port_1 = require("./infrastructure/ports/i-logger.port");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return i_logger_port_1.LogLevel; } });
// RBAC (Iteration 10: RBAC + Users)
var clickhouse_rbac_adapter_1 = require("./infrastructure/clickhouse-rbac.adapter");
Object.defineProperty(exports, "createClickHouseRBACAdapter", { enumerable: true, get: function () { return clickhouse_rbac_adapter_1.createClickHouseRBACAdapter; } });
Object.defineProperty(exports, "ClickHouseRBACAdapter", { enumerable: true, get: function () { return clickhouse_rbac_adapter_1.ClickHouseRBACAdapter; } });
var clickhouse_users_service_1 = require("./infrastructure/clickhouse-users.service");
Object.defineProperty(exports, "createClickHouseUsersService", { enumerable: true, get: function () { return clickhouse_users_service_1.createClickHouseUsersService; } });
Object.defineProperty(exports, "ClickHouseUsersService", { enumerable: true, get: function () { return clickhouse_users_service_1.ClickHouseUsersService; } });
// Config Validator (Iteration 10.2: Config Validation)
var clickhouse_config_validator_adapter_1 = require("./infrastructure/clickhouse-config-validator.adapter");
Object.defineProperty(exports, "createClickHouseConfigValidator", { enumerable: true, get: function () { return clickhouse_config_validator_adapter_1.createClickHouseConfigValidator; } });
Object.defineProperty(exports, "ClickHouseConfigValidatorAdapter", { enumerable: true, get: function () { return clickhouse_config_validator_adapter_1.ClickHouseConfigValidatorAdapter; } });
// Audit Logging (Iteration 12: Audit Logging)
var audit_logger_factory_1 = require("./infrastructure/audit-logger.factory");
Object.defineProperty(exports, "createAuditLogger", { enumerable: true, get: function () { return audit_logger_factory_1.createAuditLogger; } });
Object.defineProperty(exports, "createClickHouseAuditLogger", { enumerable: true, get: function () { return audit_logger_factory_1.createClickHouseAuditLogger; } });
Object.defineProperty(exports, "ClickHouseAuditLoggerAdapter", { enumerable: true, get: function () { return audit_logger_factory_1.ClickHouseAuditLoggerAdapter; } });
Object.defineProperty(exports, "createConsoleAuditLogger", { enumerable: true, get: function () { return audit_logger_factory_1.createConsoleAuditLogger; } });
Object.defineProperty(exports, "ConsoleAuditLoggerAdapter", { enumerable: true, get: function () { return audit_logger_factory_1.ConsoleAuditLoggerAdapter; } });
Object.defineProperty(exports, "AuditLoggerType", { enumerable: true, get: function () { return audit_logger_factory_1.AuditLoggerType; } });
var audit_log_sql_1 = require("./infrastructure/audit-log-sql");
Object.defineProperty(exports, "createAuditLogDDL", { enumerable: true, get: function () { return audit_log_sql_1.createAuditLogDDL; } });
Object.defineProperty(exports, "AUDIT_LOG_DEFAULTS", { enumerable: true, get: function () { return audit_log_sql_1.AUDIT_LOG_DEFAULTS; } });
Object.defineProperty(exports, "validateTableName", { enumerable: true, get: function () { return audit_log_sql_1.validateTableName; } });
Object.defineProperty(exports, "validateDatabaseName", { enumerable: true, get: function () { return audit_log_sql_1.validateDatabaseName; } });
var audit_log_queries_1 = require("./infrastructure/audit-log-queries");
Object.defineProperty(exports, "createAuditLogSelectByUser", { enumerable: true, get: function () { return audit_log_queries_1.createAuditLogSelectByUser; } });
Object.defineProperty(exports, "createAuditLogSelectByResource", { enumerable: true, get: function () { return audit_log_queries_1.createAuditLogSelectByResource; } });
Object.defineProperty(exports, "createAuditLogSelectByType", { enumerable: true, get: function () { return audit_log_queries_1.createAuditLogSelectByType; } });
Object.defineProperty(exports, "createAuditLogCountByUser", { enumerable: true, get: function () { return audit_log_queries_1.createAuditLogCountByUser; } });
Object.defineProperty(exports, "createAuditLogStats", { enumerable: true, get: function () { return audit_log_queries_1.createAuditLogStats; } });
__exportStar(require("./financial-reports"), exports);
// GDPR Deletion (Iteration 13)
__exportStar(require("./domain/gdpr"), exports);
var gdpr_deletion_factory_1 = require("./infrastructure/adapters/gdpr-deletion.factory");
Object.defineProperty(exports, "createGdprDeletionService", { enumerable: true, get: function () { return gdpr_deletion_factory_1.createGdprDeletionService; } });
// Rate Limiting (Iteration 14)
__exportStar(require("./domain/rate-limit"), exports);
var rate_limit_factory_1 = require("./infrastructure/adapters/rate-limit.factory");
Object.defineProperty(exports, "createRateLimitService", { enumerable: true, get: function () { return rate_limit_factory_1.createRateLimitService; } });
Object.defineProperty(exports, "createRateLimitServiceWithRedis", { enumerable: true, get: function () { return rate_limit_factory_1.createRateLimitServiceWithRedis; } });
var redis_rate_limit_adapter_1 = require("./infrastructure/adapters/redis-rate-limit.adapter");
Object.defineProperty(exports, "RedisRateLimitAdapter", { enumerable: true, get: function () { return redis_rate_limit_adapter_1.RedisRateLimitAdapter; } });
var redis_abort_adapter_1 = require("./infrastructure/adapters/redis-abort.adapter");
Object.defineProperty(exports, "RedisAbortAdapter", { enumerable: true, get: function () { return redis_abort_adapter_1.RedisAbortAdapter; } });
Object.defineProperty(exports, "ABORT_CHANNELS", { enumerable: true, get: function () { return redis_abort_adapter_1.ABORT_CHANNELS; } });
var abort_command_dto_1 = require("./domain/abort/abort-command.dto");
Object.defineProperty(exports, "createAbortCommand", { enumerable: true, get: function () { return abort_command_dto_1.createAbortCommand; } });
Object.defineProperty(exports, "serializeAbortCommand", { enumerable: true, get: function () { return abort_command_dto_1.serializeAbortCommand; } });
Object.defineProperty(exports, "deserializeAbortCommand", { enumerable: true, get: function () { return abort_command_dto_1.deserializeAbortCommand; } });
var abort_result_vo_1 = require("./domain/abort/abort-result.vo");
Object.defineProperty(exports, "abortSuccess", { enumerable: true, get: function () { return abort_result_vo_1.abortSuccess; } });
Object.defineProperty(exports, "abortNotFound", { enumerable: true, get: function () { return abort_result_vo_1.abortNotFound; } });
Object.defineProperty(exports, "abortFailed", { enumerable: true, get: function () { return abort_result_vo_1.abortFailed; } });
Object.defineProperty(exports, "isAbortSuccess", { enumerable: true, get: function () { return abort_result_vo_1.isAbortSuccess; } });
Object.defineProperty(exports, "isAbortNotFound", { enumerable: true, get: function () { return abort_result_vo_1.isAbortNotFound; } });
// Resource-Aware Configuration (Iteration 6.5: Auto-tuning)
__exportStar(require("./core"), exports);
var adapters_1 = require("./core/infrastructure/adapters");
Object.defineProperty(exports, "CgroupResourceDiscoveryAdapter", { enumerable: true, get: function () { return adapters_1.CgroupResourceDiscoveryAdapter; } });
Object.defineProperty(exports, "OSResourceDiscoveryAdapter", { enumerable: true, get: function () { return adapters_1.OSResourceDiscoveryAdapter; } });
Object.defineProperty(exports, "ConfigProfileSelectorAdapter", { enumerable: true, get: function () { return adapters_1.ConfigProfileSelectorAdapter; } });
Object.defineProperty(exports, "StartupHealthCheckAdapter", { enumerable: true, get: function () { return adapters_1.StartupHealthCheckAdapter; } });
var services_1 = require("./core/domain/services");
Object.defineProperty(exports, "ResourceCalculationService", { enumerable: true, get: function () { return services_1.ResourceCalculationService; } });
var value_objects_1 = require("./core/domain/value-objects");
Object.defineProperty(exports, "MemorySize", { enumerable: true, get: function () { return value_objects_1.MemorySize; } });
Object.defineProperty(exports, "ConfigProfile", { enumerable: true, get: function () { return value_objects_1.ConfigProfile; } });
var config_profile_type_enum_1 = require("./core/domain/value-objects/config-profile-type.enum");
Object.defineProperty(exports, "ConfigProfileType", { enumerable: true, get: function () { return config_profile_type_enum_1.ConfigProfileType; } });
var config_profile_constants_1 = require("./core/domain/value-objects/config-profile.constants");
Object.defineProperty(exports, "LOW", { enumerable: true, get: function () { return config_profile_constants_1.LOW; } });
Object.defineProperty(exports, "STANDARD", { enumerable: true, get: function () { return config_profile_constants_1.STANDARD; } });
Object.defineProperty(exports, "HIGH", { enumerable: true, get: function () { return config_profile_constants_1.HIGH; } });
var config_profile_utils_1 = require("./core/domain/value-objects/config-profile.utils");
Object.defineProperty(exports, "selectConfigProfile", { enumerable: true, get: function () { return config_profile_utils_1.selectConfigProfile; } });
Object.defineProperty(exports, "getAllConfigProfiles", { enumerable: true, get: function () { return config_profile_utils_1.getAllConfigProfiles; } });
var resource_info_vo_1 = require("./core/domain/value-objects/resource-info.vo");
Object.defineProperty(exports, "ResourceInfo", { enumerable: true, get: function () { return resource_info_vo_1.ResourceInfo; } });
Object.defineProperty(exports, "ResourceSource", { enumerable: true, get: function () { return resource_info_vo_1.ResourceSource; } });
