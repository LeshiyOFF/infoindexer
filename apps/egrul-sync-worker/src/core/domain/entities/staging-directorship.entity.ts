/**
 * Staging Directorship Entity
 *
 * @remarks
 * Raw FTM Directorship entity stored in staging layer.
 * Contains FTM entity IDs (not INN) - requires transformation via identity_mapping.
 *
 * Transformation path:
 * organization_id (FTM) → inn (via identity_mapping)
 * director_id (FTM) → director_name (via identity_mapping)
 *
 * @see StagingTransformService for transformation logic
 */
export interface StagingDirectorshipRow {
  /** FTM relationship ID */
  readonly id: string;

  /** FTM Company entity ID (requires resolution to INN) */
  readonly organization_id: string;

  /** FTM Person entity ID (requires resolution to name) */
  readonly director_id: string;

  /** Director role (e.g., 'Director', 'CEO', 'Board Member') */
  readonly role: string;

  /** Appointment date (ISO string or FTM format) */
  readonly start_date: string;

  /** Departure date (null if current) */
  readonly end_date: string | null;
}
