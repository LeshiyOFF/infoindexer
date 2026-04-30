/**
 * Shared Package - Client-safe exports
 *
 * Экспортирует только типы и константы, безопасные для использования в браузере.
 * НЕ экспортирует redis, clickhouse и другие Node.js зависимости.
 */
export * from './interfaces';
export * from './domain';
export * from './result';
export * from './errors';
export { apiSuccess, apiError, apiPaginated, ApiErrorCode, SyncStage, createSyncStatus, calculateStagePercentage, DEFAULT_SYNC_CONFIG } from './api';
export type { ApiError, Pagination, SyncStatus, SyncStatusData, SyncStatusResponse, StageProgress, StageResult, SyncConfig, GetSanctionsByInnRequest, GetSanctionsByInnResponse, GetSanctionsBatchRequest, GetSanctionsBatchResponse, GetSanctionsListRequest, GetSanctionsListResponse, SanctionStatsDTO, GetSanctionStatsResponse, DeleteSanctionsRequest, DeleteSanctionsResponse, CheckSanctionsRequest, CheckSanctionsResponse } from './api';
export * from './repositories';
export * from './financial-reports';
export { OrganizationService } from './services/organization.service';
export { GdprDeleteRequest, innValidator } from './domain/gdpr';
export type { RateLimitType, RateLimitResult } from './domain/rate-limit';
export type { SanctionDTO } from './domain/entities';
export type { IRateLimitPort } from './infrastructure/ports/i-rate-limit.port';
export type { IGdprDeletion } from './infrastructure/ports/i-gdpr-deletion.port';
