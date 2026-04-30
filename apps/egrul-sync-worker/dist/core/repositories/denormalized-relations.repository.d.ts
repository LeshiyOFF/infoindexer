/**
 * Adapter для управления денормализованными связями в ClickHouse
 *
 * @remarks
 * @deprecated Materialized Views handle aggregation automatically.
 * Use MVInsertAdapter for direct insert instead.
 *
 * MV Pattern:
 * - directors_mv auto-aggregates on INSERT to egrul_directors_denormalized
 * - founders_mv auto-aggregates on INSERT to egrul_founders_denormalized
 * - No JOIN/prepareDirectors/prepareFounders needed
 *
 * @see MVInsertAdapter for new approach
 * @see IMVInsertPort for contract
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IDenormalizedRelationsRepository } from './ports';
/**
 * Adapter для управления денормализованными связями в ClickHouse
 *
 * @deprecated Use MVInsertAdapter instead. MVs auto-update on direct INSERT.
 */
export declare class DenormalizedRelationsRepository implements IDenormalizedRelationsRepository {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * @deprecated No-op. MV auto-updates on direct INSERT.
     * Use MVInsertAdapter.insertDirectors() instead.
     */
    prepareDirectors(): Promise<void>;
    /**
     * @deprecated No-op. MV auto-updates on direct INSERT.
     * Use MVInsertAdapter.insertFounders() instead.
     */
    prepareFounders(): Promise<void>;
    /**
     * Очищает денормализованные таблицы
     *
     * @remarks
     * Still useful for testing/reset.
     * Does not affect MVs (they repopulate on next INSERT).
     */
    clear(): Promise<void>;
}
