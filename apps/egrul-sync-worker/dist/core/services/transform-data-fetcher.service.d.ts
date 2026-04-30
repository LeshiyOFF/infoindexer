/**
 * Transform Data Fetcher
 *
 * @remarks
 * Fetches and groups staging data for transformation.
 * Follows SRP: only responsible for data retrieval.
 *
 * @pattern Single Responsibility Principle
 */
import type { ClickHouseClient } from '@clickhouse/client';
/**
 * Database row from egrul_staging_companies
 */
export interface StagingCompanyDbRow {
    readonly id: string;
    readonly inn: string;
    readonly name: string;
    readonly status: string;
    readonly address: string;
    readonly first_seen?: string;
    readonly last_changed?: string;
}
/**
 * Database row from egrul_staging_directorships
 */
export interface StagingDirectorshipDbRow {
    readonly id: string;
    readonly organization_id: string;
    readonly director_id: string;
    readonly role: string;
    readonly start_date: string;
    readonly end_date?: string;
}
/**
 * Database row from egrul_staging_ownerships
 */
export interface StagingOwnershipDbRow {
    readonly id: string;
    readonly owner_id: string;
    readonly asset_id: string;
    readonly percentage: string;
    readonly shares_count: string;
    readonly start_date: string;
    readonly end_date?: string;
}
/**
 * Union type for all staging table rows
 */
export type StagingDbRow = StagingCompanyDbRow | StagingDirectorshipDbRow | StagingOwnershipDbRow;
/**
 * Fetch result with grouped data
 */
export interface StagingDataResult {
    readonly data: Map<string, StagingDbRow[]>;
    readonly totalRows: number;
}
/**
 * Transform Data Fetcher
 *
 * @remarks
 * Reads staging tables and groups by primary key.
 * Uses queryJson helper for type-safe queries.
 */
export declare class TransformDataFetcher {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Fetch and group staging data
     *
     * @remarks
     * Uses queryJson helper for type-safe query execution.
     * Result is fully typed - no 'as' assertions in business logic.
     */
    fetch(tableName: string): Promise<StagingDataResult>;
    /**
     * Group rows by primary key
     */
    private groupByPrimaryKey;
    /**
     * Extract primary key from row based on table
     */
    private extractKey;
    /** Type guard for StagingCompanyDbRow */
    private isCompanyRow;
    /** Type guard for StagingDirectorshipDbRow */
    private isDirectorshipRow;
    /** Type guard for StagingOwnershipDbRow */
    private isOwnershipRow;
}
