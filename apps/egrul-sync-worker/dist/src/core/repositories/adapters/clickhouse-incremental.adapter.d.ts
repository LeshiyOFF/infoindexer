/**
 * ClickHouse incremental identity mapping adapter
 *
 * @remarks
 * Full mode: TRUNCATE + INSERT всех записей.
 * Incremental mode: INSERT только записей с first_seen > last_sync.
 * ReplacingMergeTree автоматически дедуплицирует записи.
 *
 * SOLID: SRP, DIP (Ports), DRY (IdentityQueryBuilderService)
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IIncrementalIdentityPort, IdentityMappingResult } from '../ports/i-incremental-identity.port';
import type { IBatchProcessorPort } from '../ports/i-batch-processor.port';
import type { ISyncStateStoragePort } from '../../ports/i-sync-state-storage.port';
export declare class ClickHouseIncrementalAdapter implements IIncrementalIdentityPort {
    private readonly client;
    private readonly batchProcessor;
    private readonly syncState;
    private readonly queryBuilder;
    constructor(client: ClickHouseClient, batchProcessor: IBatchProcessorPort, syncState: ISyncStateStoragePort);
    build(mode: 'full' | 'incremental', since?: Date): Promise<IdentityMappingResult>;
    private buildFull;
    private buildIncremental;
    private getLastSyncTimestamp;
    private clearIdentityMapping;
    private insertAll;
    private insertSince;
    private executeInsert;
    private saveSyncResult;
    private getCount;
    private getCountSince;
    private mapResult;
}
