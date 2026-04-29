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
 * - All INSERT to egrul_staging_* tables (no MV triggers)
 * - Transform Service handles staging → production
 * - Prevents OOM by avoiding AggregatingMergeTree on each insert
 *
 * v1.5: Companies now use insertCompaniesForTransform instead of direct insert.
 */
class BatchFlusher {
    stagingStorage;
    constructor(stagingStorage) {
        this.stagingStorage = stagingStorage;
    }
    /**
     * Сбрасывает батчи если они достигли размера
     *
     * @remarks
     * All inserts go to staging tables (no MV triggers).
     * Transform Service (Iteration 2) will process staging → production.
     */
    async flushBatchesIfNeeded(state, batchSize) {
        // Companies → staging (via mapping from EgrulCompanyRow to StagingCompanyRow)
        if (state.companies.length >= batchSize) {
            await this.stagingStorage.insertCompaniesForTransform(state.companies);
            state.companies = [];
        }
        // Staging companies → staging (already in correct format)
        if (state.stagingCompanies.length >= batchSize) {
            await this.stagingStorage.insertCompanies(state.stagingCompanies);
            state.stagingCompanies = [];
        }
        // Directorships → staging
        if (state.directorships.length >= batchSize) {
            await this.stagingStorage.insertDirectorships(state.directorships);
            state.directorships = [];
        }
        // Ownerships → staging
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
            await this.stagingStorage.insertCompaniesForTransform(state.companies);
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
