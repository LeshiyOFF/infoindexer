/**
 * Staging Sync Service
 *
 * @remarks
 * Orchestrates EGRUL sync with staging layer.
 * Follows SRP: coordinates sync flow.
 * Follows DIP: depends on ports, not concrete adapters.
 *
 * Flow: Parse → Staging → Transform → Production → MV
 *
 * Each batch:
 * 1. Store raw FTM entities in staging tables
 * 2. Transform to production format (ID resolution)
 * 3. Insert to production tables (MV auto-updates)
 */
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import type { StagingTransformService } from './staging-transform.service';
import type { IMVInsertPort } from '../ports/i-mv-insert.port';
import type { StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../domain/entities';
import { StagingTransformResult } from '../domain/value-objects/staging-transform-result.vo';
export declare class StagingSyncService {
    private readonly stagingStorage;
    private readonly transformService;
    private readonly mvInsert;
    constructor(stagingStorage: IStagingStoragePort, transformService: StagingTransformService, mvInsert: IMVInsertPort);
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
    processBatch(companies: readonly StagingCompanyRow[], directorships: readonly StagingDirectorshipRow[], ownerships: readonly StagingOwnershipRow[]): Promise<StagingTransformResult>;
    /**
     * Clears all staging tables
     *
     * @remarks
     * Used for clean slate before sync or for testing.
     */
    clearStaging(): Promise<void>;
    private insertCompanies;
    private insertStagingRelationships;
}
