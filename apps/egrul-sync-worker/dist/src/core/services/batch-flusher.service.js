"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchFlusher = void 0;
exports.createEmptyBatchState = createEmptyBatchState;
/**
 * Factory for creating empty BatchState
 *
 * @remarks
 * DRY compliance: single source of truth for initial state.
 */
function createEmptyBatchState() {
    return {
        companies: [],
        stagingCompanies: [],
        directorships: [],
        ownerships: []
    };
}
/**
 * Сервис для батч-сброса данных в ClickHouse
 *
 * @remarks
 * Following Staging + Transform Pattern:
 * - INSERT to egrul_companies_raw → companies_mv auto-updates
 * - INSERT to egrul_staging_* tables → for later transformation
 * - INSERT to egrul_directors_denormalized → directors_mv auto-updates
 * - INSERT to egrul_founders_denormalized → founders_mv auto-updates
 */
class BatchFlusher {
    repository;
    stagingStorage;
    constructor(repository, stagingStorage) {
        this.repository = repository;
        this.stagingStorage = stagingStorage;
    }
    /**
     * Сбрасывает батчи если они достигли размера
     *
     * @remarks
     * Production inserts go directly to MV-backed tables.
     * Staging inserts go to staging tables for transformation.
     */
    async flushBatchesIfNeeded(state, batchSize) {
        if (state.companies.length >= batchSize) {
            await this.repository.insertBatch('egrul_companies_raw', state.companies);
            state.companies = [];
        }
        if (state.stagingCompanies.length >= batchSize) {
            await this.stagingStorage.insertCompanies(state.stagingCompanies);
            state.stagingCompanies = [];
        }
        if (state.directorships.length >= batchSize) {
            await this.stagingStorage.insertDirectorships(state.directorships);
            state.directorships = [];
        }
        if (state.ownerships.length >= batchSize) {
            await this.stagingStorage.insertOwnerships(state.ownerships);
            state.ownerships = [];
        }
    }
    /**
     * Сбрасывает все оставшиеся батчи
     *
     * @remarks
     * Final flush after processing all records.
     */
    async flushAllBatches(state) {
        if (state.companies.length > 0) {
            await this.repository.insertBatch('egrul_companies_raw', state.companies);
        }
        if (state.stagingCompanies.length > 0) {
            await this.stagingStorage.insertCompanies(state.stagingCompanies);
        }
        if (state.directorships.length > 0) {
            await this.stagingStorage.insertDirectorships(state.directorships);
        }
        if (state.ownerships.length > 0) {
            await this.stagingStorage.insertOwnerships(state.ownerships);
        }
    }
}
exports.BatchFlusher = BatchFlusher;
