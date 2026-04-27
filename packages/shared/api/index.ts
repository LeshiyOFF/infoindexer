/**
 * API Module Exports
 *
 * Централизованный экспорт всех API типов и контрактов.
 */

// Response types (не экспортируем ApiResponse во избежание конфликта с legacy)
export type {
  ApiError,
  Pagination
} from './responses';

export {
  apiSuccess,
  apiError,
  apiPaginated
} from './responses';

export { ApiErrorCode } from './responses';

// Sync types
export {
  SyncStage,
  createSyncStatus,
  calculateStagePercentage,
  DEFAULT_SYNC_CONFIG
} from './sync.types';

export type {
  SyncStatus,
  SyncStatusData,
  SyncStatusResponse,
  StageProgress,
  StageResult,
  SyncConfig
} from './sync.types';

// Sanction API types
export type {
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
} from './sanction.types';

// Re-export ApiResponse для прямого импорта (если нужен)
export type { ApiResponse, PaginatedResponse } from './responses';
