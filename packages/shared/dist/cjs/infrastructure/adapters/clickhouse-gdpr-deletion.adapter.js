"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseGdprDeletionAdapter = void 0;
exports.createClickHouseGdprDeletion = createClickHouseGdprDeletion;
const gdpr_1 = require("../../domain/gdpr");
const clickhouse_gdpr_deletion_constants_1 = require("./clickhouse-gdpr-deletion.constants");
const gdpr_2 = require("../../domain/gdpr");
/**
 * ClickHouse GDPR Deletion Adapter
 *
 * @remarks
 * Implements GDPR deletion using ClickHouse ALTER TABLE DELETE.
 */
class ClickHouseGdprDeletionAdapter {
    client;
    database;
    constructor(client, config) {
        this.client = client;
        this.database = config?.database || clickhouse_gdpr_deletion_constants_1.DEFAULT_DATABASE;
    }
    /**
     * Confirm deletion by counting records
     *
     * @param inn - Organization INN
     * @returns Deletion counts for all tables
     */
    async confirm(inn) {
        const counts = await this.countRecords(inn);
        return gdpr_1.GdprDeleteResult.confirmation(inn, counts);
    }
    /**
     * Execute deletion across all tables
     *
     * @param request - GDPR deletion request
     * @returns Deletion result with counts and errors
     */
    async execute(request) {
        const results = await this.deleteFromAllTables(request.inn);
        const errors = results.filter((r) => 'error' in r);
        const successes = results.filter((r) => 'count' in r);
        // Build counts from successful deletions using factory
        const counts = (0, gdpr_2.createDeletionCounts)(0, 0, 0, 0);
        // Need mutable copy for accumulation
        const mutableCounts = { ...counts };
        for (const success of successes) {
            const key = success.table;
            if (key !== 'total') {
                mutableCounts[key] = success.count;
                mutableCounts.total += success.count;
            }
        }
        // Create readonly result
        const finalCounts = {
            financial_reports: mutableCounts.financial_reports,
            financial_reports_summary: mutableCounts.financial_reports_summary,
            companies_meta: mutableCounts.companies_meta,
            company_sanctions: mutableCounts.company_sanctions,
            total: mutableCounts.total
        };
        // Partial success if at least one table deleted
        const success = successes.length > 0;
        return success ? gdpr_1.GdprDeleteResult.success(request.inn, finalCounts) : gdpr_1.GdprDeleteResult.failure(request.inn, errors);
    }
    /**
     * Check if adapter is healthy
     *
     * @returns true if client is available
     */
    isHealthy() {
        return !!this.client;
    }
    /**
     * Count records across all tables
     *
     * @param inn - Organization INN
     * @returns Deletion counts
     */
    async countRecords(inn) {
        const queries = clickhouse_gdpr_deletion_constants_1.GDPR_TABLES.map(table => this.countInTable(inn, table));
        const queryResults = await Promise.allSettled(queries);
        const countsArray = await Promise.all(queryResults.map(r => r.status === 'fulfilled' ? r.value : 0));
        return (0, gdpr_2.createDeletionCounts)(countsArray[0] || 0, countsArray[1] || 0, countsArray[2] || 0, countsArray[3] || 0);
    }
    /**
     * Count records in single table
     *
     * @param inn - Organization INN
     * @param table - Table name
     * @returns Record count
     */
    async countInTable(inn, table) {
        try {
            const result = await this.client.query({
                query: `SELECT count() as cnt FROM ${(0, clickhouse_gdpr_deletion_constants_1.getQualifiedTableName)(this.database, table)} WHERE inn = {inn:String}`,
                query_params: { inn }
            });
            const json = await result.json();
            if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object' && json[0] !== null) {
                const row = json[0];
                const cnt = typeof row.cnt === 'string' ? parseInt(row.cnt, 10) : (typeof row.cnt === 'number' ? row.cnt : 0);
                return isNaN(cnt) ? 0 : cnt;
            }
            return 0;
        }
        catch {
            return 0;
        }
    }
    /**
     * Delete from all tables in parallel
     *
     * @param inn - Organization INN
     * @returns Array of results (success or error)
     */
    async deleteFromAllTables(inn) {
        const deletions = clickhouse_gdpr_deletion_constants_1.GDPR_TABLES.map(table => this.deleteFromTable(inn, table));
        return Promise.all(deletions);
    }
    /**
     * Delete from single table
     *
     * @param inn - Organization INN
     * @param table - Table name
     * @returns Deletion result
     */
    async deleteFromTable(inn, table) {
        try {
            const beforeCount = await this.countInTable(inn, table);
            await this.client.command({
                query: `ALTER TABLE ${(0, clickhouse_gdpr_deletion_constants_1.getQualifiedTableName)(this.database, table)} DELETE WHERE inn = {inn:String}`,
                query_params: { inn }
            });
            return { table, count: beforeCount };
        }
        catch (error) {
            return {
                table,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
exports.ClickHouseGdprDeletionAdapter = ClickHouseGdprDeletionAdapter;
/**
 * Factory function
 *
 * @param client - ClickHouse client
 * @param config - Optional configuration
 * @returns IGdprDeletion instance
 */
function createClickHouseGdprDeletion(client, config) {
    return new ClickHouseGdprDeletionAdapter(client, config);
}
