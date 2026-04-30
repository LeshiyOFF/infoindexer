/**
 * MV Insert Types
 *
 * @remarks
 * Type definitions for Materialized View insert operations.
 * Following DRY: single source of truth for MV insert types.
 */
/**
 * Result of MV insert operation
 */
export interface MVInsertResult {
    readonly success: boolean;
    readonly recordsProcessed: number;
    readonly durationMs: number;
    readonly error?: Error;
}
/**
 * Progress callback data during MV insert
 */
export interface MVInsertProgress {
    readonly tableName: string;
    readonly chunkIndex: number;
    readonly totalChunks: number;
    readonly recordsProcessed: number;
    readonly totalRecords: number;
    readonly percentage: number;
}
/**
 * Configuration for MV batch insert
 */
export interface MVInsertConfig {
    readonly batchSize: number;
    readonly maxConcurrent: number;
    readonly timeoutMs: number;
}
/**
 * Default MV insert configuration
 */
export declare const DEFAULT_MV_INSERT_CONFIG: MVInsertConfig;
