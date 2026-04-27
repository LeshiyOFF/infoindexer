/**
 * Port: Generic Direct Insert for MV Tables
 *
 * @remarks
 * Generic contract for direct insert operations.
 * Following Interface Segregation: minimal, focused interface.
 * Following Dependency Inversion: Infrastructure implements this.
 *
 * Used for companies_raw insert (triggers companies_mv).
 */
import type { MVInsertConfig, MVInsertProgress, MVInsertResult } from '../domain/types/mv-insert.types';
export interface IDirectInsertPort {
    /**
     * Insert records directly into specified table
     *
     * @param tableName - Target table name
     * @param records - Array of records to insert
     * @param config - Optional insert configuration
     * @param progressCallback - Optional progress callback
     * @returns Insert result with stats
     *
     * @remarks
     * - Generic insert for any MV-backed table
     * - Respective MV auto-updates on INSERT
     * - Uses JSONEachRow format for ClickHouse
     */
    insertDirect<T extends Record<string, unknown>>(tableName: string, records: readonly T[], config?: Partial<MVInsertConfig>, progressCallback?: (progress: MVInsertProgress) => void): Promise<MVInsertResult>;
}
