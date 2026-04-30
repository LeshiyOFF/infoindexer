"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagingSyncService = void 0;
const staging_transform_result_vo_1 = require("../domain/value-objects/staging-transform-result.vo");
/**
 * Staging Sync Service
 *
 * @remarks
 * Coordinates EGRUL data flow through staging to production.
 * Transform Service handles aggregation in background.
 */
class StagingSyncService {
    stagingStorage;
    transformService;
    constructor(stagingStorage, transformService) {
        this.stagingStorage = stagingStorage;
        this.transformService = transformService;
    }
    /**
     * Processes a batch of EGRUL entities through staging
     *
     * @param companies - Company entities to store
     * @param directorships - Directorship relationships
     * @param ownerships - Ownership relationships
     * @returns Processing result with metrics
     *
     * @remarks
     * All data goes to staging tables.
     * Transform Service (polling worker) handles staging → production.
     */
    async processBatch(companies, directorships, ownerships) {
        if (companies.length === 0 && directorships.length === 0 && ownerships.length === 0) {
            return staging_transform_result_vo_1.StagingTransformResult.success(0, 0, 0);
        }
        await Promise.all([
            this.insertCompanies(companies),
            this.insertStagingRelationships(directorships, ownerships)
        ]);
        // Trigger transform if threshold reached
        const transformResults = await this.transformService.transformIfNeeded();
        const totalProcessed = companies.length + directorships.length + ownerships.length;
        const directorsTransformed = transformResults
            .filter(r => r.tableName === 'egrul_staging_directorships')
            .reduce((sum, r) => sum + r.rowsProcessed, 0);
        const foundersTransformed = transformResults
            .filter(r => r.tableName === 'egrul_staging_ownerships')
            .reduce((sum, r) => sum + r.rowsProcessed, 0);
        return staging_transform_result_vo_1.StagingTransformResult.success(directorsTransformed, foundersTransformed, 0);
    }
    /**
     * Clears all staging tables
     *
     * @remarks
     * Used for clean slate before sync or for testing.
     */
    async clearStaging() {
        await this.stagingStorage.truncateAll();
    }
    /**
     * Insert companies to staging
     *
     * @param records - Company records
     */
    async insertCompanies(records) {
        if (records.length === 0) {
            return;
        }
        await this.stagingStorage.insertCompanies(records);
    }
    /**
     * Insert relationships to staging
     *
     * @param directorships - Directorship records
     * @param ownerships - Ownership records
     */
    async insertStagingRelationships(directorships, ownerships) {
        await Promise.all([
            this.stagingStorage.insertDirectorships(directorships),
            this.stagingStorage.insertOwnerships(ownerships)
        ]);
    }
}
exports.StagingSyncService = StagingSyncService;
