"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagingSyncService = void 0;
const staging_transform_result_vo_1 = require("../domain/value-objects/staging-transform-result.vo");
class StagingSyncService {
    stagingStorage;
    transformService;
    mvInsert;
    constructor(stagingStorage, transformService, mvInsert) {
        this.stagingStorage = stagingStorage;
        this.transformService = transformService;
        this.mvInsert = mvInsert;
    }
    /**
     * Processes a batch of EGRUL entities through staging → transform → production
     *
     * @param companies - Company entities to store
     * @param directorships - Directorship relationships to transform
     * @param ownerships - Ownership relationships to transform
     * @returns Transformation result with metrics
     *
     * @remarks
     * Companies go directly to production (no transformation needed).
     * Directorships and ownerships are transformed via identity_mapping.
     */
    async processBatch(companies, directorships, ownerships) {
        if (companies.length === 0 && directorships.length === 0 && ownerships.length === 0) {
            return staging_transform_result_vo_1.StagingTransformResult.success(0, 0, 0);
        }
        await Promise.all([
            this.insertCompanies(companies),
            this.insertStagingRelationships(directorships, ownerships)
        ]);
        const result = await this.transformService.transformAll(directorships, ownerships);
        if (result.totalProcessed > 0) {
            const [directors, founders] = await Promise.all([
                this.transformService.transformDirectorships(directorships),
                this.transformService.transformOwnerships(ownerships)
            ]);
            if (directors.length > 0 || founders.length > 0) {
                await this.mvInsert.insertAll(directors, founders);
            }
        }
        return result;
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
    async insertCompanies(records) {
        if (records.length === 0) {
            return;
        }
        await this.stagingStorage.insertCompanies(records);
    }
    async insertStagingRelationships(directorships, ownerships) {
        await Promise.all([
            this.stagingStorage.insertDirectorships(directorships),
            this.stagingStorage.insertOwnerships(ownerships)
        ]);
    }
}
exports.StagingSyncService = StagingSyncService;
