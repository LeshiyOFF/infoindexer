"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVInsertAdapter = void 0;
const mv_insert_types_1 = require("../../domain/types/mv-insert.types");
const DIRECTORS_TABLE = 'egrul_directors_denormalized';
const FOUNDERS_TABLE = 'egrul_founders_denormalized';
/**
 * ClickHouse adapter for MV-backed direct insert
 */
class MVInsertAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    async insertDirectors(directors, config, progressCallback) {
        return this.insertIntoTable(DIRECTORS_TABLE, directors, config, progressCallback);
    }
    async insertFounders(founders, config, progressCallback) {
        return this.insertIntoTable(FOUNDERS_TABLE, founders, config, progressCallback);
    }
    async insertAll(directors, founders, config, progressCallback) {
        const startTime = Date.now();
        const [directorsResult, foundersResult] = await Promise.all([
            this.insertDirectors(directors, config, progressCallback),
            this.insertFounders(founders, config, progressCallback)
        ]);
        return {
            directors: directorsResult,
            founders: foundersResult,
            totalDurationMs: Date.now() - startTime
        };
    }
    /**
     * Generic insert into table with chunking
     *
     * @remarks
     * Splits large arrays into chunks for memory efficiency.
     * Each chunk triggers respective MV auto-aggregation.
     */
    async insertIntoTable(tableName, records, config, progressCallback) {
        const startTime = Date.now();
        const finalConfig = { ...mv_insert_types_1.DEFAULT_MV_INSERT_CONFIG, ...config };
        const totalRecords = records.length;
        if (totalRecords === 0) {
            return {
                success: true,
                recordsProcessed: 0,
                durationMs: 0
            };
        }
        const totalChunks = Math.ceil(totalRecords / finalConfig.batchSize);
        let processed = 0;
        for (let i = 0; i < totalChunks; i++) {
            const offset = i * finalConfig.batchSize;
            const chunk = records.slice(offset, offset + finalConfig.batchSize);
            await this.client.insert({
                table: tableName,
                values: chunk,
                format: 'JSONEachRow'
            });
            processed += chunk.length;
            if (progressCallback) {
                progressCallback({
                    tableName,
                    chunkIndex: i,
                    totalChunks,
                    recordsProcessed: processed,
                    totalRecords,
                    percentage: (processed / totalRecords) * 100
                });
            }
        }
        return {
            success: true,
            recordsProcessed: processed,
            durationMs: Date.now() - startTime
        };
    }
}
exports.MVInsertAdapter = MVInsertAdapter;
