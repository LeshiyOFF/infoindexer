/**
 * ClickHouse Staging Adapter
 *
 * @remarks
 * Implements IStagingStoragePort for ClickHouse.
 * Follows Adapter pattern: infrastructure detail.
 * Follows SRP: only handles staging table operations.
 *
 * Uses JSONEachRow format for efficient bulk inserts.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IStagingStoragePort } from '../../domain/ports/i-staging-storage.port';
import type { StagingCompanyRow, StagingDirectorshipRow, StagingOwnershipRow } from '../../domain/entities';

export class ClickHouseStagingAdapter implements IStagingStoragePort {
  constructor(private readonly client: ClickHouseClient) {}

  async insertCompanies(records: readonly StagingCompanyRow[]): Promise<number> {
    if (records.length === 0) {
      return 0;
    }

    await this.client.insert({
      table: 'egrul_staging_companies',
      values: records,
      format: 'JSONEachRow'
    });

    return records.length;
  }

  async insertDirectorships(records: readonly StagingDirectorshipRow[]): Promise<number> {
    if (records.length === 0) {
      return 0;
    }

    await this.client.insert({
      table: 'egrul_staging_directorships',
      values: records,
      format: 'JSONEachRow'
    });

    return records.length;
  }

  async insertOwnerships(records: readonly StagingOwnershipRow[]): Promise<number> {
    if (records.length === 0) {
      return 0;
    }

    await this.client.insert({
      table: 'egrul_staging_ownerships',
      values: records,
      format: 'JSONEachRow'
    });

    return records.length;
  }

  async truncateAll(): Promise<void> {
    const queries = [
      'TRUNCATE TABLE IF EXISTS egrul_staging_companies',
      'TRUNCATE TABLE IF EXISTS egrul_staging_directorships',
      'TRUNCATE TABLE IF EXISTS egrul_staging_ownerships'
    ];

    await Promise.all(
      queries.map(query => this.client.command({ query }))
    );
  }
}
