/**
 * Sync Types
 *
 * Типы для синхронизации данных (EGRUL + Sanctions)
 */
import type { ApiResponse } from './responses';
/**
 * Стадии синхронизации
 */
export declare enum SyncStage {
    IDLE = "idle",
    EGRUL_DOWNLOAD = "egrul_download",
    EGRUL_PARSE = "egrul_parse",
    SANCTIONS_DOWNLOAD = "sanctions_download",
    SANCTIONS_PARSE = "sanctions_parse",
    MERGE_COMPANIES = "merge_companies",
    MERGE_SANCTIONS = "merge_sanctions",
    CLEANUP = "cleanup",
    COMPLETED = "completed",
    ERROR = "error"
}
/**
 * Статус синхронизации
 */
export type SyncStatus = 'idle' | 'running' | 'completed' | 'error';
/**
 * Данные о статусе синхронизации
 */
export interface SyncStatusData {
    readonly status: SyncStatus;
    readonly stage: SyncStage;
    readonly percentage?: number;
    readonly message: string;
    readonly startedAt?: string;
    readonly completedAt?: string;
    readonly error?: string;
}
/**
 * Response для статуса синхронизации
 */
export type SyncStatusResponse = ApiResponse<SyncStatusData>;
/**
 * Progress обновления стадии
 */
export interface StageProgress {
    readonly stage: SyncStage;
    readonly percentage: number;
    readonly message: string;
    readonly details?: Record<string, unknown>;
}
/**
 * Результат выполнения стадии
 */
export type StageResult = {
    success: true;
    processed: number;
} | {
    success: false;
    error: string;
};
/**
 * Конфигурация синхронизации
 */
export interface SyncConfig {
    readonly batchSize: number;
    readonly maxRetries: number;
    readonly timeout: number;
    readonly skipExisting: boolean;
}
/**
 * Значения конфигурации по умолчанию
 */
export declare const DEFAULT_SYNC_CONFIG: SyncConfig;
/**
 * Создаёт данные статуса синхронизации
 */
export declare function createSyncStatus(status: SyncStatus, stage: SyncStage, message: string, percentage?: number, startedAt?: string, error?: string): SyncStatusData;
/**
 * Вычисляет процент выполнения по стадии
 */
export declare function calculateStagePercentage(stage: SyncStage): number;
