/**
 * ClickHouse GDPR Deletion Adapter
 *
 * @remarks
 * Infrastructure Layer: ClickHouse implementation of IGdprDeletion.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port: IGdprDeletion
 * - Adapter: This class
 * - Implements Port contract using ClickHouse Client
 *
 * Design Decisions:
 * - Parallel deletion using Promise.all
 * - Partial success handling (continue if one table fails)
 * - query_params for SQL injection protection
 * - ONE source of truth for table names (from constants)
 *
 * Error Handling:
 * - Table-specific errors collected and returned
 * - At least one success = partial success
 * - All failures = total failure
 *
 * Iteration 13: GDPR Right-to-Delete
 */
import type { IGdprDeletion } from '../ports/i-gdpr-deletion.port';
import type { GdprDeleteRequest, GdprDeleteResult } from '../../domain/gdpr';
import type { ClickHouseClient } from '@clickhouse/client';
/**
 * ClickHouse GDPR Deletion Adapter
 *
 * @remarks
 * Implements GDPR deletion using ClickHouse ALTER TABLE DELETE.
 */
export declare class ClickHouseGdprDeletionAdapter implements IGdprDeletion {
    private readonly client;
    private readonly database;
    constructor(client: ClickHouseClient, config?: {
        database?: string;
    });
    /**
     * Confirm deletion by counting records
     *
     * @param inn - Organization INN
     * @returns Deletion counts for all tables
     */
    confirm(inn: string): Promise<GdprDeleteResult>;
    /**
     * Execute deletion across all tables
     *
     * @param request - GDPR deletion request
     * @returns Deletion result with counts and errors
     */
    execute(request: GdprDeleteRequest): Promise<GdprDeleteResult>;
    /**
     * Check if adapter is healthy
     *
     * @returns true if client is available
     */
    isHealthy(): boolean;
    /**
     * Count records across all tables
     *
     * @param inn - Organization INN
     * @returns Deletion counts
     */
    private countRecords;
    /**
     * Count records in single table
     *
     * @param inn - Organization INN
     * @param table - Table name
     * @returns Record count
     */
    private countInTable;
    /**
     * Delete from all tables in parallel
     *
     * @param inn - Organization INN
     * @returns Array of results (success or error)
     */
    private deleteFromAllTables;
    /**
     * Delete from single table
     *
     * @param inn - Organization INN
     * @param table - Table name
     * @returns Deletion result
     */
    private deleteFromTable;
}
/**
 * Factory function
 *
 * @param client - ClickHouse client
 * @param config - Optional configuration
 * @returns IGdprDeletion instance
 */
export declare function createClickHouseGdprDeletion(client: ClickHouseClient, config?: {
    database?: string;
}): IGdprDeletion;
