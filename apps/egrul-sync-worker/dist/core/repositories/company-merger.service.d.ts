/**
 * Сервис для мёржа данных в companies_meta
 *
 * @remarks
 * @deprecated Materialized Views handle aggregation automatically.
 *
 * MV Pattern (Three MV Approach):
 * - companies_mv: Aggregates argMaxState(name, status, address) on INSERT
 * - directors_mv: Aggregates groupArrayState(director_name) on INSERT
 * - founders_mv: Aggregates groupArrayState(founder_name) on INSERT
 * - v_companies_meta: VIEW that JOINs all 3 MVs for read
 *
 * Memory: 5.6GB → ~200MB (28x reduction)
 * No merge stage needed - MVs update incrementally.
 *
 * @see v_companies_meta for reading aggregated data
 */
import type { ClickHouseClient } from '@clickhouse/client';
/**
 * Сервис для мёржа данных в companies_meta
 *
 * @deprecated No-op. MVs handle aggregation automatically.
 */
export declare class CompanyMergerService {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * @deprecated No-op. Materialized Views handle aggregation automatically.
     *
     * Read from v_companies_meta VIEW instead.
     * MVs update on each INSERT to respective raw tables.
     */
    merge(): Promise<void>;
}
