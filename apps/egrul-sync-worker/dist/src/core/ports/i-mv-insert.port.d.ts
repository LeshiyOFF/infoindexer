/**
 * Port: Materialized View Direct Insert
 *
 * @remarks
 * Defines contract for direct insert into MV-backed tables.
 * Following Dependency Inversion: Infrastructure depends on this port.
 * Following Interface Segregation: focused on MV insert operations.
 *
 * MV Pattern: Each INSERT triggers auto-aggregation in respective MV.
 *
 * @example
 * ```ts
 * await mvInsertPort.insertDirectors([
 *   { inn: '1234567890', director_name: 'Ivan Ivanov' }
 * ]);
 * // directors_mv auto-updates with groupArrayState(director_name)
 * ```
 */
import type { EgrulDirectorRow, EgrulFounderRow } from '../domain/entities';
import type { MVInsertConfig, MVInsertProgress, MVInsertResult } from '../domain/types/mv-insert.types';
export interface IMVInsertPort {
    /**
     * Insert directors directly into denormalized table
     *
     * @param directors - Array of director records
     * @param config - Optional insert configuration
     * @param progressCallback - Optional progress callback
     * @returns Insert result with stats
     *
     * @remarks
     * - Direct insert to egrul_directors_denormalized
     * - directors_mv auto-updates with groupArrayState(director_name)
     * - No intermediate transform layer needed
     */
    insertDirectors(directors: readonly EgrulDirectorRow[], config?: Partial<MVInsertConfig>, progressCallback?: (progress: MVInsertProgress) => void): Promise<MVInsertResult>;
    /**
     * Insert founders directly into denormalized table
     *
     * @param founders - Array of founder records
     * @param config - Optional insert configuration
     * @param progressCallback - Optional progress callback
     * @returns Insert result with stats
     *
     * @remarks
     * - Direct insert to egrul_founders_denormalized
     * - founders_mv auto-updates with groupArrayState(founder_name)
     * - No intermediate transform layer needed
     */
    insertFounders(founders: readonly EgrulFounderRow[], config?: Partial<MVInsertConfig>, progressCallback?: (progress: MVInsertProgress) => void): Promise<MVInsertResult>;
    /**
     * Insert both directors and founders in parallel
     *
     * @param directors - Array of director records
     * @param founders - Array of founder records
     * @param config - Optional insert configuration
     * @param progressCallback - Optional progress callback
     * @returns Combined insert result
     *
     * @remarks
     * Executes inserts concurrently for better performance.
     * MVs update independently on each table insert.
     */
    insertAll(directors: readonly EgrulDirectorRow[], founders: readonly EgrulFounderRow[], config?: Partial<MVInsertConfig>, progressCallback?: (progress: MVInsertProgress) => void): Promise<{
        directors: MVInsertResult;
        founders: MVInsertResult;
        totalDurationMs: number;
    }>;
}
