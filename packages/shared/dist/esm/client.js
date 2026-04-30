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
export { apiSuccess, apiError, apiPaginated, ApiErrorCode, SyncStage, createSyncStatus, calculateStagePercentage, DEFAULT_SYNC_CONFIG } from './api';
// Repository Interfaces (Ports)
export * from './repositories';
// Services (pure functions только)
export * from './financial-reports';
// Organization Service
export { OrganizationService } from './services/organization.service';
// Domain - GDPR
export { GdprDeleteRequest, innValidator } from './domain/gdpr';
