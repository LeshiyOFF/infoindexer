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
import { IdentityQueryBuilderService } from '../identity-query-builder.service';

const SYNC_TYPE_IDENTITY = 'identity_mapping';
const PERSONS_TABLE = 'egrul_persons_raw';
const COMPANIES_TABLE = 'egrul_companies_raw';

export class ClickHouseIncrementalAdapter implements IIncrementalIdentityPort {
  private readonly queryBuilder = new IdentityQueryBuilderService();

  constructor(
    private readonly client: ClickHouseClient,
    private readonly batchProcessor: IBatchProcessorPort,
    private readonly syncState: ISyncStateStoragePort
  ) {}

  async build(mode: 'full' | 'incremental', since?: Date): Promise<IdentityMappingResult> {
    return mode === 'full'
      ? this.buildFull()
      : this.buildIncremental(since ?? await this.getLastSyncTimestamp());
  }

  private async buildFull(): Promise<IdentityMappingResult> {
    const startTime = Date.now();
    console.log('[Incremental] Building identity mapping (FULL mode)...');

    await this.clearIdentityMapping();
    const counts = await this.insertAll();
    const durationMs = Date.now() - startTime;

    await this.saveSyncResult(counts.total, durationMs);
    console.log(`[Incremental] Full sync completed: ${counts.total} records in ${durationMs}ms`);

    return this.mapResult(counts, durationMs);
  }

  private async buildIncremental(since: Date): Promise<IdentityMappingResult> {
    const startTime = Date.now();
    console.log(`[Incremental] Building identity mapping (INCREMENTAL mode, since ${since.toISOString()})...`);

    const counts = await this.insertSince(since);
    const durationMs = Date.now() - startTime;

    await this.saveSyncResult(counts.total, durationMs);
    console.log(`[Incremental] Incremental sync completed: ${counts.total} records in ${durationMs}ms`);

    return this.mapResult(counts, durationMs);
  }

  private async getLastSyncTimestamp(): Promise<Date> {
    const lastSync = await this.syncState.getLastSyncTimestamp(SYNC_TYPE_IDENTITY);
    return lastSync ?? new Date(0);
  }

  private async clearIdentityMapping(): Promise<void> {
    await this.client.command({
      query: 'TRUNCATE TABLE IF EXISTS egrul_identity_mapping'
    });
  }

  private async insertAll(): Promise<InsertCounts> {
    await this.executeInsert(this.queryBuilder.buildPersonQuery(false));
    await this.executeInsert(this.queryBuilder.buildCompanyEntityQuery(false));
    await this.executeInsert(this.queryBuilder.buildCompanyInnQuery(false));

    const persons = await this.getCount(PERSONS_TABLE);
    const companyEntities = await this.getCount(COMPANIES_TABLE);
    const companyInns = await this.getCount(COMPANIES_TABLE);

    return { persons, companyEntities, companyInns, get total() { return persons + companyEntities + companyInns; } };
  }

  private async insertSince(since: Date): Promise<InsertCounts> {
    await this.executeInsert(this.queryBuilder.buildPersonQuery(true), since);
    await this.executeInsert(this.queryBuilder.buildCompanyEntityQuery(true), since);
    await this.executeInsert(this.queryBuilder.buildCompanyInnQuery(true), since);

    const persons = await this.getCountSince(PERSONS_TABLE, since);
    const companyEntities = await this.getCountSince(COMPANIES_TABLE, since);
    const companyInns = await this.getCountSince(COMPANIES_TABLE, since);

    return { persons, companyEntities, companyInns, get total() { return persons + companyEntities + companyInns; } };
  }

  private async executeInsert(query: string, since?: Date): Promise<void> {
    await this.client.command({
      query,
      query_params: since ? { since: since.toISOString() } : undefined
    });
  }

  private async saveSyncResult(totalRecords: number, durationMs: number): Promise<void> {
    await this.syncState.saveSyncResult(SYNC_TYPE_IDENTITY, new Date(), totalRecords, durationMs);
  }

  private async getCount(table: string): Promise<number> {
    const result = await this.client.query({
      query: `SELECT count() as cnt FROM ${table}`,
      format: 'JSONEachRow'
    });
    const rows = await result.json() as { cnt: string }[];
    return parseInt(rows[0].cnt, 10);
  }

  private async getCountSince(table: string, since: Date): Promise<number> {
    const result = await this.client.query({
      query: `SELECT count() as cnt FROM ${table} WHERE first_seen > {since:DateTime}`,
      query_params: { since: since.toISOString() },
      format: 'JSONEachRow'
    });
    const rows = await result.json() as { cnt: string }[];
    return parseInt(rows[0].cnt, 10);
  }

  private mapResult(counts: InsertCounts, durationMs: number): IdentityMappingResult {
    return {
      personsProcessed: counts.persons,
      companiesProcessed: counts.companyEntities + counts.companyInns,
      durationMs
    };
  }
}

interface InsertCounts {
  readonly persons: number;
  readonly companyEntities: number;
  readonly companyInns: number;
  get total(): number;
}
