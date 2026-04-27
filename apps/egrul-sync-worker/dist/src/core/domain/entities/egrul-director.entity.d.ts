/**
 * EGRUL Director Entity
 *
 * @remarks
 * Domain entity representing a director for direct insert.
 * Following MV approach: no intermediate transform layer.
 *
 * MV Pattern: directors_mv auto-aggregates on INSERT.
 *
 * @see egrul_directors_denormalized table schema
 */
export interface EgrulDirectorRow {
    /** Company INN (normalized) */
    readonly inn: string;
    /** Director full name */
    readonly director_name: string;
}
