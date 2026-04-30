"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformDataFetcher = void 0;
const clickhouse_query_helper_1 = require("../infrastructure/clickhouse-query.helper");
/**
 * Transform Data Fetcher
 *
 * @remarks
 * Reads staging tables and groups by primary key.
 * Uses queryJson helper for type-safe queries.
 */
class TransformDataFetcher {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Fetch and group staging data
     *
     * @remarks
     * Uses queryJson helper for type-safe query execution.
     * Result is fully typed - no 'as' assertions in business logic.
     */
    async fetch(tableName) {
        const rows = await (0, clickhouse_query_helper_1.queryJson)(this.client, `SELECT * FROM ${tableName} SETTINGS max_threads = 1`);
        const grouped = this.groupByPrimaryKey(tableName, rows);
        return {
            data: grouped,
            totalRows: rows.length
        };
    }
    /**
     * Group rows by primary key
     */
    groupByPrimaryKey(tableName, rows) {
        const grouped = new Map();
        for (const row of rows) {
            const key = this.extractKey(tableName, row);
            if (!key)
                continue;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key).push(row);
        }
        return grouped;
    }
    /**
     * Extract primary key from row based on table
     */
    extractKey(tableName, row) {
        if (this.isCompanyRow(row)) {
            return row.inn;
        }
        if (this.isDirectorshipRow(row)) {
            return row.organization_id;
        }
        if (this.isOwnershipRow(row)) {
            return row.asset_id;
        }
        return null;
    }
    /** Type guard for StagingCompanyDbRow */
    isCompanyRow(row) {
        return 'inn' in row;
    }
    /** Type guard for StagingDirectorshipDbRow */
    isDirectorshipRow(row) {
        return 'organization_id' in row;
    }
    /** Type guard for StagingOwnershipDbRow */
    isOwnershipRow(row) {
        return 'asset_id' in row;
    }
}
exports.TransformDataFetcher = TransformDataFetcher;
