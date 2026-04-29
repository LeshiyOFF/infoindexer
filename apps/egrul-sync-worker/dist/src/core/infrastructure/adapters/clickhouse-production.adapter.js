"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseProductionAdapter = void 0;
const production_stats_dto_1 = require("../../domain/dto/production-stats.dto");
class ClickHouseProductionAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    async insertCompanies(companies) {
        if (companies.length === 0)
            return 0;
        await this.client.insert({
            table: 'companies_production',
            values: companies,
            format: 'JSONEachRow'
        });
        return companies.length;
    }
    async insertDirectors(directors) {
        if (directors.length === 0)
            return 0;
        await this.client.insert({
            table: 'directors_production',
            values: directors,
            format: 'JSONEachRow'
        });
        return directors.length;
    }
    async insertFounders(founders) {
        if (founders.length === 0)
            return 0;
        await this.client.insert({
            table: 'founders_production',
            values: founders,
            format: 'JSONEachRow'
        });
        return founders.length;
    }
    async getStats(tableName) {
        const result = await this.client.query({
            query: `
        SELECT
          table as table_name,
          sum(rows) as rows,
          sum(bytes_on_disk) as bytes_on_disk
        FROM system.parts
        WHERE table = {table_name: String}
          AND active = 1
        GROUP BY table
      `,
            query_params: { table_name: tableName },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        if (rows.length === 0) {
            return new production_stats_dto_1.ProductionStats(tableName, 0, 0, new Date());
        }
        return production_stats_dto_1.ProductionStats.fromClickHouse({
            table_name: rows[0].table_name,
            rows: rows[0].rows,
            bytes_on_disk: rows[0].bytes_on_disk
        });
    }
}
exports.ClickHouseProductionAdapter = ClickHouseProductionAdapter;
