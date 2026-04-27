/**
 * Staging Ownership Entity
 *
 * @remarks
 * Raw FTM Ownership entity stored in staging layer.
 * Contains FTM entity IDs - requires transformation via identity_mapping.
 *
 * Transformation path:
 * asset_id (FTM) → inn (via identity_mapping)
 * owner_id (FTM) → founder_name (via identity_mapping)
 *
 * Ownership details (percentage, shares) are preserved in staging
 * but not used in simplified denormalized table.
 *
 * @see StagingTransformService for transformation logic
 */
export interface StagingOwnershipRow {
    /** FTM relationship ID */
    readonly id: string;
    /** FTM Owner entity ID (person or company) */
    readonly owner_id: string;
    /** FTM Asset (company) entity ID */
    readonly asset_id: string;
    /** Ownership percentage (string to preserve precision) */
    readonly percentage: string;
    /** Number of shares (if applicable) */
    readonly shares_count: string;
    /** Acquisition date (ISO string or FTM format) */
    readonly start_date: string;
    /** Disposal date (null if current) */
    readonly end_date: string | null;
}
