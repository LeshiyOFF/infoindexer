/**
 * Sync All API Types
 *
 * Типы для API полной синхронизации.
 */

import type { SyncStage, SyncStatus } from 'shared/client';

/**
 * Статус полной синхронизации
 */
export interface SyncAllStatusData {
  readonly status: SyncStatus;
  readonly stage: SyncStage;
  readonly percentage: number;
  readonly message: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly error?: string;
}

/**
 * Response для статуса синхронизации
 */
export type SyncAllStatusResponse =
  | { success: true; data: SyncAllStatusData }
  | { success: false; error: { code: string; message: string } };

/**
 * Request для запуска синхронизации
 */
export interface SyncAllStartRequest {
  readonly enableEnrichment?: boolean;
}

/**
 * Response для запуска синхронизации
 */
export type SyncAllStartResponse =
  | { success: true; data: { message: string } }
  | { success: false; error: { code: string; message: string } };

/**
 * Создаёт успешный response
 */
export function syncAllSuccess(data: SyncAllStatusData): SyncAllStatusResponse {
  return { success: true, data };
}

/**
 * Создаёт response с ошибкой
 */
export function syncAllError(code: string, message: string): SyncAllStatusResponse {
  return { success: false, error: { code, message } };
}

/**
 * Создаёт успешный start response
 */
export function syncAllStartSuccess(message: string): SyncAllStartResponse {
  return { success: true, data: { message } };
}

/**
 * Создаёт start response с ошибкой
 */
export function syncAllStartError(code: string, message: string): SyncAllStartResponse {
  return { success: false, error: { code, message } };
}
