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
export declare class ClickHouseIdentityResolverAdapter implements IIdentityResolverPort {
    private readonly client;
    private static readonly COMPANY_QUERY;
    private static readonly PERSON_QUERY;
    private static readonly COMPANY_BATCH_QUERY;
    private static readonly PERSON_BATCH_QUERY;
    constructor(client: ClickHouseClient);
    resolveCompanyToInn(companyId: string): Promise<string | null>;
    resolvePersonToName(personId: string): Promise<string | null>;
    resolveBatch(companyIds: readonly string[], personIds: readonly string[]): Promise<{
        companyToInn: ReadonlyMap<string, string>;
        personToName: ReadonlyMap<string, string>;
    }>;
    private resolveCompaniesBatch;
    private resolvePersonsBatch;
}
