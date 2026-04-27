/**
 * Adapter: Materialized View Direct Insert for ClickHouse
 *
 * @remarks
 * Implements IMVInsertPort for ClickHouse with MV-backed tables.
 * Following Hexagonal Architecture: adapter implements port.
 * Following SRP: responsible only for MV insert operations.
 *
 * MV Pattern: Each INSERT triggers auto-aggregation in respective MV.
 * - directors_mv: Aggregates groupArrayState(director_name)
 * - founders_mv: Aggregates groupArrayState(founder_name)
 *
 * @see IMVInsertPort
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type {
  EgrulDirectorRow,
  EgrulFounderRow
} from '../../domain/entities';
import type {
  MVInsertConfig,
  MVInsertProgress,
  MVInsertResult
} from '../../domain/types/mv-insert.types';
import type { IMVInsertPort } from '../../ports/i-mv-insert.port';
import { DEFAULT_MV_INSERT_CONFIG } from '../../domain/types/mv-insert.types';

const DIRECTORS_TABLE = 'egrul_directors_denormalized';
const FOUNDERS_TABLE = 'egrul_founders_denormalized';

/**
 * ClickHouse adapter for MV-backed direct insert
 */
export class MVInsertAdapter implements IMVInsertPort {
  constructor(private readonly client: ClickHouseClient) {}

  async insertDirectors(
    directors: readonly EgrulDirectorRow[],
    config?: Partial<MVInsertConfig>,
    progressCallback?: (progress: MVInsertProgress) => void
  ): Promise<MVInsertResult> {
    return this.insertIntoTable(DIRECTORS_TABLE, directors, config, progressCallback);
  }

  async insertFounders(
    founders: readonly EgrulFounderRow[],
    config?: Partial<MVInsertConfig>,
    progressCallback?: (progress: MVInsertProgress) => void
  ): Promise<MVInsertResult> {
    return this.insertIntoTable(FOUNDERS_TABLE, founders, config, progressCallback);
  }

  async insertAll(
    directors: readonly EgrulDirectorRow[],
    founders: readonly EgrulFounderRow[],
    config?: Partial<MVInsertConfig>,
    progressCallback?: (progress: MVInsertProgress) => void
  ): Promise<{
    directors: MVInsertResult;
    founders: MVInsertResult;
    totalDurationMs: number;
  }> {
    const startTime = Date.now();

    const [directorsResult, foundersResult] = await Promise.all([
      this.insertDirectors(directors, config, progressCallback),
      this.insertFounders(founders, config, progressCallback)
    ]);

    return {
      directors: directorsResult,
      founders: foundersResult,
      totalDurationMs: Date.now() - startTime
    };
  }

  /**
   * Generic insert into table with chunking
   *
   * @remarks
   * Splits large arrays into chunks for memory efficiency.
   * Each chunk triggers respective MV auto-aggregation.
   */
  private async insertIntoTable<T>(
    tableName: string,
    records: readonly T[],
    config?: Partial<MVInsertConfig>,
    progressCallback?: (progress: MVInsertProgress) => void
  ): Promise<MVInsertResult> {
    const startTime = Date.now();
    const finalConfig = { ...DEFAULT_MV_INSERT_CONFIG, ...config };
    const totalRecords = records.length;

    if (totalRecords === 0) {
      return {
        success: true,
        recordsProcessed: 0,
        durationMs: 0
      };
    }

    const totalChunks = Math.ceil(totalRecords / finalConfig.batchSize);
    let processed = 0;

    for (let i = 0; i < totalChunks; i++) {
      const offset = i * finalConfig.batchSize;
      const chunk = records.slice(offset, offset + finalConfig.batchSize);

      await this.client.insert({
        table: tableName,
        values: chunk,
        format: 'JSONEachRow'
      });

      processed += chunk.length;

      if (progressCallback) {
        progressCallback({
          tableName,
          chunkIndex: i,
          totalChunks,
          recordsProcessed: processed,
          totalRecords,
          percentage: (processed / totalRecords) * 100
        });
      }
    }

    return {
      success: true,
      recordsProcessed: processed,
      durationMs: Date.now() - startTime
    };
  }
}
