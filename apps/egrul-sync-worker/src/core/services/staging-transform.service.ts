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

export class StagingTransformService {
  constructor(
    private readonly identityResolver: IIdentityResolverPort
  ) {}

  /**
   * Transforms directorship records from staging to production format
   *
   * @param records - Raw staging directorship records
   * @returns Production-ready director records
   *
   * @remarks
   * Filters out records where organization_id or director_id cannot be resolved.
   */
  async transformDirectorships(
    records: readonly StagingDirectorshipRow[]
  ): Promise<EgrulDirectorRow[]> {
    if (records.length === 0) {
      return [];
    }

    const organizationIds = records.map(r => r.organization_id);
    const directorIds = records.map(r => r.director_id);

    const { companyToInn, personToName } = await this.identityResolver.resolveBatch(
      organizationIds,
      directorIds
    );

    return records
      .filter(record =>
        companyToInn.has(record.organization_id) &&
        personToName.has(record.director_id)
      )
      .map(record => ({
        inn: companyToInn.get(record.organization_id)!,
        director_name: personToName.get(record.director_id)!
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
  async transformOwnerships(
    records: readonly StagingOwnershipRow[]
  ): Promise<EgrulFounderRow[]> {
    if (records.length === 0) {
      return [];
    }

    const assetIds = records.map(r => r.asset_id);
    const ownerIds = records.map(r => r.owner_id);

    const { companyToInn, personToName } = await this.identityResolver.resolveBatch(
      assetIds,
      ownerIds
    );

    return records
      .filter(record =>
        companyToInn.has(record.asset_id) &&
        personToName.has(record.owner_id)
      )
      .map(record => ({
        inn: companyToInn.get(record.asset_id)!,
        founder_name: personToName.get(record.owner_id)!
      }));
  }

  /**
   * Transforms all staging records and returns detailed result
   *
   * @param directorships - Raw staging directorship records
   * @param ownerships - Raw staging ownership records
   * @returns Transformation result with metrics
   */
  async transformAll(
    directorships: readonly StagingDirectorshipRow[],
    ownerships: readonly StagingOwnershipRow[]
  ): Promise<StagingTransformResult> {
    const startTime = Date.now();

    try {
      const [directors, founders] = await Promise.all([
        this.transformDirectorships(directorships),
        this.transformOwnerships(ownerships)
      ]);

      const durationMs = Date.now() - startTime;

      return StagingTransformResult.success(
        directors.length,
        founders.length,
        durationMs
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      return StagingTransformResult.failure(
        0,
        0,
        errorObj,
        durationMs
      );
    }
  }
}
