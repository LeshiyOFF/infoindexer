"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformStateManager = void 0;
const clickhouse_query_helper_1 = require("../infrastructure/clickhouse-query.helper");
/**
 * Transform State Manager
 *
 * @remarks
 * Handles all operations on egrul_transform_state table.
 * Uses queryJson helper for type-safe queries.
 */
class TransformStateManager {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Set transform status
     */
    async setStatus(tableName, status) {
        await this.client.insert({
            table: 'egrul_transform_state',
            values: [{
                    table_name: tableName,
                    last_staging_count: 0,
                    last_transform_at: new Date(),
                    status,
                    error_message: '',
                    updated_at: new Date()
                }],
            format: 'JSONEachRow'
        });
    }
    /**
     * Set transform error status
     */
    async setError(tableName, error) {
        await this.client.insert({
            table: 'egrul_transform_state',
            values: [{
                    table_name: tableName,
                    last_staging_count: 0,
                    last_transform_at: new Date(),
                    status: 'error',
                    error_message: error,
                    updated_at: new Date()
                }],
            format: 'JSONEachRow'
        });
    }
    /**
     * Get all transform states
     *
     * @remarks
     * Uses queryJson helper for type-safe query execution.
     * Result is fully typed - no 'as' assertions in business logic.
     */
    async getAll() {
        const rows = await (0, clickhouse_query_helper_1.queryJson)(this.client, `
        SELECT
          table_name,
          last_staging_count,
          last_transform_at,
          status,
          error_message
        FROM egrul_transform_state
        ORDER BY table_name
      `);
        return rows.map(row => ({
            table_name: row.table_name,
            last_staging_count: Number(row.last_staging_count),
            last_transform_at: new Date(row.last_transform_at),
            status: row.status,
            error_message: row.error_message
        }));
    }
    /**
     * Get state for specific table
     */
    async get(tableName) {
        const all = await this.getAll();
        return all.find(r => r.table_name === tableName) || null;
    }
}
exports.TransformStateManager = TransformStateManager;
