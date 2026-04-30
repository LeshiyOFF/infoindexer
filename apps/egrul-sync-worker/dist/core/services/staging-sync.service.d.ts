/**
 * Staging Sync Service
 *
 * @remarks
 * Orchestrates EGRUL sync with staging layer.
 * Follows SRP: coordinates sync flow.
 * Follows DIP: depends on ports, not concrete adapters.
 *
 * Flow: Parse → Staging → Transform Service (background) → Production
 *
 * v2.0: Removed IMVInsertPort dependency (staging+transform pattern).
 */
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import { StagingTransformResult } from '../domain/value-objects/staging-transform-result.vo';
import type { StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../domain/entities';
import type { ITransformService } from '../domain/ports/i-transform-service.port';
/**
 * Staging Sync Service
 *
 * @remarks
 * Coordinates EGRUL data flow through staging to production.
 * Transform Service handles aggregation in background.
 */
export declare class StagingSyncService {
    private readonly stagingStorage;
    private readonly transformService;
    constructor(stagingStorage: IStagingStoragePort, transformService: ITransformService);
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
    processBatch(companies: readonly StagingCompanyRow[], directorships: readonly StagingDirectorshipRow[], ownerships: readonly StagingOwnershipRow[]): Promise<StagingTransformResult>;
    /**
     * Clears all staging tables
     *
     * @remarks
     * Used for clean slate before sync or for testing.
     */
    clearStaging(): Promise<void>;
    /**
     * Insert companies to staging
     *
     * @param records - Company records
     */
    private insertCompanies;
    /**
     * Insert relationships to staging
     *
     * @param directorships - Directorship records
     * @param ownerships - Ownership records
     */
    private insertStagingRelationships;
}
