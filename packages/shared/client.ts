/**
 * Shared Package - Client-safe exports
 *
 * Экспортирует только типы и константы, безопасные для использования в браузере.
 * НЕ экспортирует redis, clickhouse и другие Node.js зависимости.
 */

// Core types
export * from './interfaces';

// Domain Layer (только типы, без runtime зависимостей)
export * from './domain';

// Result Type
export * from './result';

// Domain Errors
export * from './errors';

// API Types & Contracts (только типы и pure functions)
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
  ApiError,
  Pagination,
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

// Repository Interfaces (Ports)
export * from './repositories';

// Services (pure functions только)
export * from './financial-reports';

// Organization Service
export { OrganizationService } from './services/organization.service';

// Domain - GDPR
export { GdprDeleteRequest, innValidator } from './domain/gdpr';

// Domain - Rate Limit
export type { RateLimitType, RateLimitResult } from './domain/rate-limit';

// Domain - Entities
export type { SanctionDTO } from './domain/entities';

// Infrastructure Ports (для server-side API routes)
export type { IRateLimitPort } from './infrastructure/ports/i-rate-limit.port';
export type { IGdprDeletion } from './infrastructure/ports/i-gdpr-deletion.port';
