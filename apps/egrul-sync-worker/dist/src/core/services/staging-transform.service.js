"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagingTransformService = void 0;
const staging_transform_result_vo_1 = require("../domain/value-objects/staging-transform-result.vo");
class StagingTransformService {
    identityResolver;
    constructor(identityResolver) {
        this.identityResolver = identityResolver;
    }
    /**
     * Transforms directorship records from staging to production format
     *
     * @param records - Raw staging directorship records
     * @returns Production-ready director records
     *
     * @remarks
     * Filters out records where organization_id or director_id cannot be resolved.
     */
    async transformDirectorships(records) {
        if (records.length === 0) {
            return [];
        }
        const organizationIds = records.map(r => r.organization_id);
        const directorIds = records.map(r => r.director_id);
        const { companyToInn, personToName } = await this.identityResolver.resolveBatch(organizationIds, directorIds);
        return records
            .filter(record => companyToInn.has(record.organization_id) &&
            personToName.has(record.director_id))
            .map(record => ({
            inn: companyToInn.get(record.organization_id),
            director_name: personToName.get(record.director_id)
        }));
    }
    /**
     * Transforms ownership records from staging to production format
     *
     * @param records - Raw staging ownership records
     * @returns Production-ready founder records
     *
     * @remarks
     * Filters out records where asset_id or owner_id cannot be resolved.
     * Note: Ownership details (percentage, shares) are not preserved
     * in simplified denormalized table.
     */
    async transformOwnerships(records) {
        if (records.length === 0) {
            return [];
        }
        const assetIds = records.map(r => r.asset_id);
        const ownerIds = records.map(r => r.owner_id);
        const { companyToInn, personToName } = await this.identityResolver.resolveBatch(assetIds, ownerIds);
        return records
            .filter(record => companyToInn.has(record.asset_id) &&
            personToName.has(record.owner_id))
            .map(record => ({
            inn: companyToInn.get(record.asset_id),
            founder_name: personToName.get(record.owner_id)
        }));
    }
    /**
     * Transforms all staging records and returns detailed result
     *
     * @param directorships - Raw staging directorship records
     * @param ownerships - Raw staging ownership records
     * @returns Transformation result with metrics
     */
    async transformAll(directorships, ownerships) {
        const startTime = Date.now();
        try {
            const [directors, founders] = await Promise.all([
                this.transformDirectorships(directorships),
                this.transformOwnerships(ownerships)
            ]);
            const durationMs = Date.now() - startTime;
            return staging_transform_result_vo_1.StagingTransformResult.success(directors.length, founders.length, durationMs);
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            const errorObj = error instanceof Error ? error : new Error(String(error));
            return staging_transform_result_vo_1.StagingTransformResult.failure(0, 0, errorObj, durationMs);
        }
    }
}
exports.StagingTransformService = StagingTransformService;
