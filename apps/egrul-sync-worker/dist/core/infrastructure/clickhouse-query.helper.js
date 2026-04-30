"use strict";
/**
 * Type-safe ClickHouse query helper
 *
 * @remarks
 * Provides type-safe query execution for ClickHouse client.
 * Ensures proper type inference without relying on 'as' assertions in business logic.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryJson = queryJson;
exports.queryJsonParams = queryJsonParams;
/**
 * Execute query and return typed JSON rows
 *
 * @remarks
 * This is the ONLY place where 'as' assertion is used.
 * All other code uses this helper for type safety.
 *
 * @param client - ClickHouse client
 * @param query - SQL query
 * @returns Typed array of rows
 *
 * @example
 * ```typescript
 * const rows = await queryJson<CompanyRow>(client, 'SELECT * FROM companies');
 * // rows: CompanyRow[] - fully typed
 * ```
 */
async function queryJson(client, query) {
    const resultSet = await client.query({
        query,
        format: 'JSONEachRow'
    });
    // Type assertion is isolated to this single function
    // All business logic gets fully typed results
    const rows = (await resultSet.json());
    return rows;
}
/**
 * Execute query with parameters and return typed JSON rows
 */
async function queryJsonParams(client, query, params) {
    const resultSet = await client.query({
        query,
        query_params: params,
        format: 'JSONEachRow'
    });
    const rows = (await resultSet.json());
    return rows;
}
