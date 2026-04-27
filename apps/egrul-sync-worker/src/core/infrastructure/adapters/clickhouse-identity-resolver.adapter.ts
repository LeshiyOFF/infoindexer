/**
 * ClickHouse Identity Resolver Adapter
 *
 * @remarks
 * Implements IIdentityResolverPort using identity_mapping table.
 * Follows Adapter pattern: infrastructure detail.
 * Follows SRP: only handles identity resolution.
 *
 * Resolution is performed via queries to egrul_identity_mapping table
 * which stores FTM entity ID → canonical ID mappings.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IIdentityResolverPort } from '../../domain/ports/i-identity-resolver.port';

interface QueryResult {
  readonly canonical_id: string;
}

interface BatchQueryResult {
  readonly raw_id: string;
  readonly canonical_id: string;
}

export class ClickHouseIdentityResolverAdapter implements IIdentityResolverPort {
  private static readonly COMPANY_QUERY = `
    SELECT canonical_id
    FROM egrul_identity_mapping
    WHERE id_type = 'company_entity' AND raw_id = {id:String}
    LIMIT 1
  `;

  private static readonly PERSON_QUERY = `
    SELECT canonical_id
    FROM egrul_identity_mapping
    WHERE id_type = 'person_entity' AND raw_id = {id:String}
    LIMIT 1
  `;

  private static readonly COMPANY_BATCH_QUERY = `
    SELECT raw_id, canonical_id
    FROM egrul_identity_mapping
    WHERE id_type = 'company_entity' AND raw_id IN ({ids:Array(String)})
  `;

  private static readonly PERSON_BATCH_QUERY = `
    SELECT raw_id, canonical_id
    FROM egrul_identity_mapping
    WHERE id_type = 'person_entity' AND raw_id IN ({ids:Array(String)})
  `;

  constructor(private readonly client: ClickHouseClient) {}

  async resolveCompanyToInn(companyId: string): Promise<string | null> {
    const resultSet = await this.client.query({
      query: ClickHouseIdentityResolverAdapter.COMPANY_QUERY,
      query_params: { id: companyId },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json() as QueryResult[];
    return rows.length > 0 ? rows[0].canonical_id : null;
  }

  async resolvePersonToName(personId: string): Promise<string | null> {
    const resultSet = await this.client.query({
      query: ClickHouseIdentityResolverAdapter.PERSON_QUERY,
      query_params: { id: personId },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json() as QueryResult[];
    return rows.length > 0 ? rows[0].canonical_id : null;
  }

  async resolveBatch(
    companyIds: readonly string[],
    personIds: readonly string[]
  ): Promise<{
    companyToInn: ReadonlyMap<string, string>;
    personToName: ReadonlyMap<string, string>;
  }> {
    const [companyResult, personResult] = await Promise.all([
      this.resolveCompaniesBatch(companyIds),
      this.resolvePersonsBatch(personIds)
    ]);

    return {
      companyToInn: new Map(Object.entries(companyResult)),
      personToName: new Map(Object.entries(personResult))
    };
  }

  private async resolveCompaniesBatch(
    ids: readonly string[]
  ): Promise<Record<string, string>> {
    if (ids.length === 0) {
      return {};
    }

    const resultSet = await this.client.query({
      query: ClickHouseIdentityResolverAdapter.COMPANY_BATCH_QUERY,
      query_params: { ids },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json() as BatchQueryResult[];
    return Object.fromEntries(
      rows.map((r) => [r.raw_id, r.canonical_id])
    );
  }

  private async resolvePersonsBatch(
    ids: readonly string[]
  ): Promise<Record<string, string>> {
    if (ids.length === 0) {
      return {};
    }

    const resultSet = await this.client.query({
      query: ClickHouseIdentityResolverAdapter.PERSON_BATCH_QUERY,
      query_params: { ids },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json() as BatchQueryResult[];
    return Object.fromEntries(
      rows.map((r) => [r.raw_id, r.canonical_id])
    );
  }
}
