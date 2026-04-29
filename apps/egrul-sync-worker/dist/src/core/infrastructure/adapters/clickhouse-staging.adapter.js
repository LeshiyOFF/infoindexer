"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseStagingAdapter = void 0;
const staging_stats_dto_1 = require("../../domain/dto/staging-stats.dto");
class ClickHouseStagingAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    async insertCompanies(records) {
        if (records.length === 0) {
            return 0;
        }
        await this.client.insert({
            table: 'egrul_staging_companies',
            values: records,
            format: 'JSONEachRow'
        });
        return records.length;
    }
    async insertDirectorships(records) {
        if (records.length === 0) {
            return 0;
        }
        await this.client.insert({
            table: 'egrul_staging_directorships',
            values: records,
            format: 'JSONEachRow'
        });
        return records.length;
    }
    async insertOwnerships(records) {
        if (records.length === 0) {
            return 0;
        }
        await this.client.insert({
            table: 'egrul_staging_ownerships',
            values: records,
            format: 'JSONEachRow'
        });
        return records.length;
    }
    async truncateAll() {
        const queries = [
            'TRUNCATE TABLE IF EXISTS egrul_staging_companies',
            'TRUNCATE TABLE IF EXISTS egrul_staging_directorships',
            'TRUNCATE TABLE IF EXISTS egrul_staging_ownerships'
        ];
        await Promise.all(queries.map(query => this.client.command({ query })));
    }
    /**
     * Inserts companies for future transformation
     *
     * @remarks
     * Maps EgrulCompanyRow → StagingCompanyRow and inserts into staging.
     *
     * Mapping:
     * - Date → DateTime64(3, 'UTC') conversion
     * - Optional fields handling (first_seen, last_changed)
     */
    async insertCompaniesForTransform(records) {
        if (records.length === 0)
            return 0;
        const stagingRows = records.map(r => ({
            id: r.id,
            inn: r.inn,
            name: r.name,
            status: r.status,
            address: r.address,
            first_seen: r.first_seen ? new Date(r.first_seen) : undefined,
            last_changed: r.last_changed ? new Date(r.last_changed) : undefined
        }));
        return this.insertCompanies(stagingRows);
    }
    /**
     * Gets statistics for a staging table
     *
     * @remarks
     * Queries egrul_transform_state for transform status.
     */
    async getStats(tableName) {
        const result = await this.client.query({
            query: `
        SELECT
          count() as row_count,
          max(last_transform_at) as last_transform_at,
          status
        FROM egrul_transform_state
        WHERE table_name = {table_name: String}
      `,
            query_params: { table_name: tableName },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        if (rows.length === 0 || rows[0].row_count === 0) {
            return new staging_stats_dto_1.StagingStats(tableName, 0, 0, new Date('1970-01-01'), 'idle');
        }
        return staging_stats_dto_1.StagingStats.fromRaw({
            table_name: tableName,
            last_staging_count: Number(rows[0].row_count),
            last_transform_at: rows[0].last_transform_at || '1970-01-01',
            status: rows[0].status || 'idle'
        });
    }
    /**
     * Truncates a specific staging table
     *
     * @remarks
     * Used by Transform Service for cleanup after successful transform.
     */
    async truncate(tableName) {
        await this.client.command({
            query: `TRUNCATE TABLE IF EXISTS ${tableName}`
        });
    }
}
exports.ClickHouseStagingAdapter = ClickHouseStagingAdapter;
