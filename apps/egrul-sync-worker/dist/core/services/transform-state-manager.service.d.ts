/**
 * Transform State Manager
 *
 * @remarks
 * Manages egrul_transform_state table operations.
 * Follows SRP: only responsible for transform state.
 *
 * @pattern Single Responsibility Principle
 * @pattern Repository Pattern
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { TransformStatus } from '../domain/ports/i-transform-service.port';
/**
 * Transform state record (domain model)
 */
interface TransformStateRecord {
    readonly table_name: string;
    readonly last_staging_count: number;
    readonly last_transform_at: Date;
    readonly status: TransformStatus;
    readonly error_message?: string;
}
/**
 * Transform State Manager
 *
 * @remarks
 * Handles all operations on egrul_transform_state table.
 * Uses queryJson helper for type-safe queries.
 */
export declare class TransformStateManager {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Set transform status
     */
    setStatus(tableName: string, status: TransformStatus): Promise<void>;
    /**
     * Set transform error status
     */
    setError(tableName: string, error: string): Promise<void>;
    /**
     * Get all transform states
     *
     * @remarks
     * Uses queryJson helper for type-safe query execution.
     * Result is fully typed - no 'as' assertions in business logic.
     */
    getAll(): Promise<TransformStateRecord[]>;
    /**
     * Get state for specific table
     */
    get(tableName: string): Promise<TransformStateRecord | null>;
}
export {};
