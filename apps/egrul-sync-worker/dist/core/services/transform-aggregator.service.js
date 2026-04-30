"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformAggregatorService = void 0;
/**
 * Transform Aggregator Service
 *
 * @remarks
 * Performs table-specific aggregation logic.
 * Uses strict typing - no any/unknown types.
 */
class TransformAggregatorService {
    productionStorage;
    constructor(productionStorage) {
        this.productionStorage = productionStorage;
    }
    /**
     * Aggregate and insert companies
     *
     * @param data - Grouped staging data by INN
     */
    async aggregateCompanies(data) {
        const companies = [];
        for (const [inn, rows] of data) {
            const typedRows = rows;
            const latest = this.getLatestCompanyRow(typedRows);
            companies.push({
                inn,
                name: latest.name,
                status: latest.status,
                address: latest.address,
                updated_at: new Date()
            });
        }
        if (companies.length === 0) {
            return 0;
        }
        return this.productionStorage.insertCompanies(companies);
    }
    /**
     * Aggregate and insert directors
     *
     * @param data - Grouped staging data by organization_id
     */
    async aggregateDirectors(data) {
        const directors = [];
        const seen = new Set();
        for (const [orgId, rows] of data) {
            const typedRows = rows;
            for (const row of typedRows) {
                const key = `${orgId}:${row.director_id}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    directors.push({
                        inn: orgId,
                        director_name: row.director_id,
                        updated_at: new Date()
                    });
                }
            }
        }
        if (directors.length === 0) {
            return 0;
        }
        return this.productionStorage.insertDirectors(directors);
    }
    /**
     * Aggregate and insert founders
     *
     * @param data - Grouped staging data by asset_id
     */
    async aggregateFounders(data) {
        const founders = [];
        const seen = new Set();
        for (const [assetId, rows] of data) {
            const typedRows = rows;
            for (const row of typedRows) {
                const key = `${assetId}:${row.owner_id}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    founders.push({
                        inn: assetId,
                        founder_name: row.owner_id,
                        updated_at: new Date()
                    });
                }
            }
        }
        if (founders.length === 0) {
            return 0;
        }
        return this.productionStorage.insertFounders(founders);
    }
    /**
     * Get latest company row by date
     *
     * @param rows - Array of company rows
     * @returns Row with latest date
     */
    getLatestCompanyRow(rows) {
        return rows.reduce((a, b) => {
            const dateA = new Date(a.last_changed || a.first_seen || 0);
            const dateB = new Date(b.last_changed || b.first_seen || 0);
            return dateB > dateA ? b : a;
        });
    }
}
exports.TransformAggregatorService = TransformAggregatorService;
