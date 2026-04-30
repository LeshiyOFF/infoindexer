/**
 * Staging Company Entity
 *
 * @remarks
 * Raw FTM Company entity stored in staging layer.
 * Immutable, follows Value Object semantics.
 * Used as intermediate storage before transformation to production tables.
 *
 * @see StagingTransformService for transformation logic
 */
export interface StagingCompanyRow {
    /** FTM entity ID (unique identifier) */
    readonly id: string;
    /** Company Tax ID (primary business key) */
    readonly inn: string;
    /** Company legal name */
    readonly name: string;
    /** Company registration status (ACTIVE, LIQUIDATED, etc.) */
    readonly status: string;
    /** Company legal address */
    readonly address: string;
    /** First appearance in source (from FTM first_seen) */
    readonly first_seen?: Date;
    /** Last modification date (from FTM last_change) */
    readonly last_changed?: Date;
}
