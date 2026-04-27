/**
 * GDPR Deletion Port
 *
 * @remarks
 * Infrastructure Layer (Port): Contract for GDPR deletion operations.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): Interface defining deletion contract
 * - Adapter (Infrastructure Layer): ClickHouse implementation
 * - Dependencies: Only domain types (no infrastructure details)
 *
 * Iteration 13: GDPR Right-to-Delete
 */

import type { GdprDeleteRequest, GdprDeleteResult } from '../../domain/gdpr';

/**
 * GDPR Deletion Service Port
 *
 * @remarks
 * Defines contract for GDPR right-to-delete operations.
 * Allows switching between different storage backends
 * without changing domain logic.
 *
 * @example
 * ```typescript
 * // Confirm deletion (get counts)
 * const result = await service.confirm('7777777777');
 * console.log(`Will delete ${result.counts.total} records`);
 *
 * // Execute deletion
 * const request = GdprDeleteRequest.create('7777777777', 'admin-user');
 * const deleted = await service.execute(request);
 * console.log(`Deleted ${deleted.counts.total} records`);
 * ```
 */
export interface IGdprDeletion {
  /**
   * Confirm deletion by returning record counts
   *
   * @param inn - Organization INN (10 or 12 digits)
   * @returns Promise with deletion counts
   *
   * @remarks
   * Counts records across all tables without deleting.
   * Used for user confirmation before actual deletion.
   *
   * @throws InvalidInnError if INN format is invalid
   * @throws Error if database query fails
   */
  confirm(inn: string): Promise<GdprDeleteResult>;

  /**
   * Execute deletion of all organization data
   *
   * @param request - GDPR deletion request
   * @returns Promise with deletion result
   *
   * @remarks
   * Deletes records from all tables in parallel.
   * Returns partial results if some tables fail.
   *
   * Tables affected:
   * - financial_reports (primary data)
   * - financial_reports_summary (aggregates)
   * - companies_meta (metadata)
   * - company_sanctions (sanctions)
   *
   * @throws InvalidInnError if INN format is invalid
   * @throws Error if all deletion operations fail
   */
  execute(request: GdprDeleteRequest): Promise<GdprDeleteResult>;

  /**
   * Check if service is healthy
   *
   * @returns true if service can process requests
   */
  isHealthy?(): boolean;
}
