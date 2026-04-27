"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseStagingAdapter = void 0;
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
}
exports.ClickHouseStagingAdapter = ClickHouseStagingAdapter;
