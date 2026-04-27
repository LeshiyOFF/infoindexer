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
import type { EgrulDirectorRow, EgrulFounderRow } from '../../domain/entities';
import type { MVInsertConfig, MVInsertProgress, MVInsertResult } from '../../domain/types/mv-insert.types';
import type { IMVInsertPort } from '../../ports/i-mv-insert.port';
/**
 * ClickHouse adapter for MV-backed direct insert
 */
export declare class MVInsertAdapter implements IMVInsertPort {
    private readonly client;
    constructor(client: ClickHouseClient);
    insertDirectors(directors: readonly EgrulDirectorRow[], config?: Partial<MVInsertConfig>, progressCallback?: (progress: MVInsertProgress) => void): Promise<MVInsertResult>;
    insertFounders(founders: readonly EgrulFounderRow[], config?: Partial<MVInsertConfig>, progressCallback?: (progress: MVInsertProgress) => void): Promise<MVInsertResult>;
    insertAll(directors: readonly EgrulDirectorRow[], founders: readonly EgrulFounderRow[], config?: Partial<MVInsertConfig>, progressCallback?: (progress: MVInsertProgress) => void): Promise<{
        directors: MVInsertResult;
        founders: MVInsertResult;
        totalDurationMs: number;
    }>;
    /**
     * Generic insert into table with chunking
     *
     * @remarks
     * Splits large arrays into chunks for memory efficiency.
     * Each chunk triggers respective MV auto-aggregation.
     */
    private insertIntoTable;
}
