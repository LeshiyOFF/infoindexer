/**
 * EGRUL Founder Entity
 *
 * @remarks
 * Domain entity representing a founder for direct insert.
 * Following MV approach: no intermediate transform layer.
 *
 * MV Pattern: founders_mv auto-aggregates on INSERT.
 *
 * @see egrul_founders_denormalized table schema
 */
export interface EgrulFounderRow {
  /** Company INN (normalized) */
  readonly inn: string;

  /** Founder full name */
  readonly founder_name: string;
}
