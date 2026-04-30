/**
 * Staging Transform Service
 *
 * @remarks
 * Transforms raw FTM entities from staging into production-ready records.
 * Uses IdentityResolver for ID → canonical mapping.
 *
 * Follows SRP: only transforms data.
 * Follows DIP: depends on IIdentityResolverPort (abstraction).
 *
 * Transformation path:
 * - StagingDirectorship → EgrulDirectorRow (via identity_mapping)
 * - StagingOwnership → EgrulFounderRow (via identity_mapping)
 *
 * Records that cannot be resolved are filtered out (not transformed).
 */
import type { StagingDirectorshipRow, StagingOwnershipRow } from '../domain/entities';
import type { EgrulDirectorRow, EgrulFounderRow } from '../domain/entities';
import type { IIdentityResolverPort } from '../domain/ports/i-identity-resolver.port';
import { StagingTransformResult } from '../domain/value-objects/staging-transform-result.vo';
export declare class StagingTransformService {
    private readonly identityResolver;
    constructor(identityResolver: IIdentityResolverPort);
    /**
     * Transforms directorship records from staging to production format
     *
     * @param records - Raw staging directorship records
     * @returns Production-ready director records
     *
     * @remarks
     * Filters out records where organization_id or director_id cannot be resolved.
     */
    transformDirectorships(records: readonly StagingDirectorshipRow[]): Promise<EgrulDirectorRow[]>;
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
    transformOwnerships(records: readonly StagingOwnershipRow[]): Promise<EgrulFounderRow[]>;
    /**
     * Transforms all staging records and returns detailed result
     *
     * @param directorships - Raw staging directorship records
     * @param ownerships - Raw staging ownership records
     * @returns Transformation result with metrics
     */
    transformAll(directorships: readonly StagingDirectorshipRow[], ownerships: readonly StagingOwnershipRow[]): Promise<StagingTransformResult>;
}
