"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseIncrementalAdapter = void 0;
const identity_query_builder_service_1 = require("../identity-query-builder.service");
const SYNC_TYPE_IDENTITY = 'identity_mapping';
const PERSONS_TABLE = 'egrul_persons_raw';
const COMPANIES_TABLE = 'egrul_companies_raw';
class ClickHouseIncrementalAdapter {
    client;
    batchProcessor;
    syncState;
    queryBuilder = new identity_query_builder_service_1.IdentityQueryBuilderService();
    constructor(client, batchProcessor, syncState) {
        this.client = client;
        this.batchProcessor = batchProcessor;
        this.syncState = syncState;
    }
    async build(mode, since) {
        return mode === 'full'
            ? this.buildFull()
            : this.buildIncremental(since ?? await this.getLastSyncTimestamp());
    }
    async buildFull() {
        const startTime = Date.now();
        console.log('[Incremental] Building identity mapping (FULL mode)...');
        await this.clearIdentityMapping();
        const counts = await this.insertAll();
        const durationMs = Date.now() - startTime;
        await this.saveSyncResult(counts.total, durationMs);
        console.log(`[Incremental] Full sync completed: ${counts.total} records in ${durationMs}ms`);
        return this.mapResult(counts, durationMs);
    }
    async buildIncremental(since) {
        const startTime = Date.now();
        console.log(`[Incremental] Building identity mapping (INCREMENTAL mode, since ${since.toISOString()})...`);
        const counts = await this.insertSince(since);
        const durationMs = Date.now() - startTime;
        await this.saveSyncResult(counts.total, durationMs);
        console.log(`[Incremental] Incremental sync completed: ${counts.total} records in ${durationMs}ms`);
        return this.mapResult(counts, durationMs);
    }
    async getLastSyncTimestamp() {
        const lastSync = await this.syncState.getLastSyncTimestamp(SYNC_TYPE_IDENTITY);
        return lastSync ?? new Date(0);
    }
    async clearIdentityMapping() {
        await this.client.command({
            query: 'TRUNCATE TABLE IF EXISTS egrul_identity_mapping'
        });
    }
    async insertAll() {
        await this.executeInsert(this.queryBuilder.buildPersonQuery(false));
        await this.executeInsert(this.queryBuilder.buildCompanyEntityQuery(false));
        await this.executeInsert(this.queryBuilder.buildCompanyInnQuery(false));
        const persons = await this.getCount(PERSONS_TABLE);
        const companyEntities = await this.getCount(COMPANIES_TABLE);
        const companyInns = await this.getCount(COMPANIES_TABLE);
        return { persons, companyEntities, companyInns, get total() { return persons + companyEntities + companyInns; } };
    }
    async insertSince(since) {
        await this.executeInsert(this.queryBuilder.buildPersonQuery(true), since);
        await this.executeInsert(this.queryBuilder.buildCompanyEntityQuery(true), since);
        await this.executeInsert(this.queryBuilder.buildCompanyInnQuery(true), since);
        const persons = await this.getCountSince(PERSONS_TABLE, since);
        const companyEntities = await this.getCountSince(COMPANIES_TABLE, since);
        const companyInns = await this.getCountSince(COMPANIES_TABLE, since);
        return { persons, companyEntities, companyInns, get total() { return persons + companyEntities + companyInns; } };
    }
    async executeInsert(query, since) {
        await this.client.command({
            query,
            query_params: since ? { since: since.toISOString() } : undefined
        });
    }
    async saveSyncResult(totalRecords, durationMs) {
        await this.syncState.saveSyncResult(SYNC_TYPE_IDENTITY, new Date(), totalRecords, durationMs);
    }
    async getCount(table) {
        const result = await this.client.query({
            query: `SELECT count() as cnt FROM ${table}`,
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        return parseInt(rows[0].cnt, 10);
    }
    async getCountSince(table, since) {
        const result = await this.client.query({
            query: `SELECT count() as cnt FROM ${table} WHERE first_seen > {since:DateTime}`,
            query_params: { since: since.toISOString() },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        return parseInt(rows[0].cnt, 10);
    }
    mapResult(counts, durationMs) {
        return {
            personsProcessed: counts.persons,
            companiesProcessed: counts.companyEntities + counts.companyInns,
            durationMs
        };
    }
}
exports.ClickHouseIncrementalAdapter = ClickHouseIncrementalAdapter;
