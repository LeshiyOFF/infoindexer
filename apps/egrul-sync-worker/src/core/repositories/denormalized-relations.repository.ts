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

const DIRECTORS_TABLE = 'egrul_directors_denormalized';
const FOUNDERS_TABLE = 'egrul_founders_denormalized';

/**
 * Adapter для управления денормализованными связями в ClickHouse
 *
 * @deprecated Use MVInsertAdapter instead. MVs auto-update on direct INSERT.
 */
export class DenormalizedRelationsRepository implements IDenormalizedRelationsRepository {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * @deprecated No-op. MV auto-updates on direct INSERT.
   * Use MVInsertAdapter.insertDirectors() instead.
   */
  async prepareDirectors(): Promise<void> {
    console.log('[DEPRECATED] DenormalizedRelationsRepository.prepareDirectors() called.');
    console.log('MV (directors_mv) auto-updates on INSERT to egrul_directors_denormalized.');
    console.log('Use MVInsertAdapter.insertDirectors() for direct insert.');
  }

  /**
   * @deprecated No-op. MV auto-updates on direct INSERT.
   * Use MVInsertAdapter.insertFounders() instead.
   */
  async prepareFounders(): Promise<void> {
    console.log('[DEPRECATED] DenormalizedRelationsRepository.prepareFounders() called.');
    console.log('MV (founders_mv) auto-updates on INSERT to egrul_founders_denormalized.');
    console.log('Use MVInsertAdapter.insertFounders() for direct insert.');
  }

  /**
   * Очищает денормализованные таблицы
   *
   * @remarks
   * Still useful for testing/reset.
   * Does not affect MVs (they repopulate on next INSERT).
   */
  async clear(): Promise<void> {
    console.log('Clearing denormalized tables...');

    await this.client.command({
      query: `TRUNCATE TABLE IF EXISTS ${DIRECTORS_TABLE}`
    });

    await this.client.command({
      query: `TRUNCATE TABLE IF EXISTS ${FOUNDERS_TABLE}`
    });

    console.log('Denormalized tables cleared');
  }
}
