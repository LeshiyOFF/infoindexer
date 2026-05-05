/**
 * Port: ITransformService
 *
 * @remarks
 * Interface for staging → production transformation service.
 * Defines contract for transforming data from staging tables to production tables.
 *
 * Follows Dependency Inversion: high-level modules depend on this abstraction.
 * Follows Interface Segregation: focused, single-purpose interface.
 *
 * @pattern Hexagonal / Ports & Adapters
 * @pattern Dependency Inversion Principle
 */
import type { TransformResult } from '../dto/transform-result.dto';

/**
 * Transform Status
 *
 * @remarks
 * Current status of a staging table transformation.
 */
export type TransformStatus = 'idle' | 'running' | 'error';

/**
 * Transform Table Status
 *
 * @remarks
 * Contains status information for a single staging table.
 */
export interface TransformTableStatus {
  readonly tableName: string;
  readonly rowCount: number;
  readonly status: TransformStatus;
  readonly lastTransformAt: Date | null;
  readonly errorMessage?: string;
}

/**
 * Transform Service Port
 *
 * @remarks
 * Defines contract for staging → production transformation.
 *
 * Architecture (after Migration 022 + Commit 4):
 * - Single entry point: transformAll() runs full transform
 * - Production tables truncated before transform (start fresh)
 * - Staging tables truncated after full success only (preserves data on partial failure)
 *
 * Responsibilities:
 * - Execute full transform (companies → directors → founders)
 * - Truncate staging tables on full success
 * - Report transform status for monitoring
 * - Reset transform state for recovery
 *
 * Used by:
 * - Manual operations (admin interface)
 * - Recovery procedures (after abort/failure)
 */
export interface ITransformService {
  /**
   * Run full transformation: companies → directors → founders.
   *
   * @remarks
   * Truncates production tables before transform.
   * Truncates staging tables after full success only.
   * Preserves staging data on partial failure for retry.
   *
   * @returns Array of TransformResult, one per table.
   */
  transformAll(): Promise<TransformResult[]>;

  /**
   * Get transform status for all staging tables
   *
   * @remarks
   * Queries egrul_transform_state table for current status.
   * Used for monitoring and health checks.
   *
   * @returns Array of table status information
   */
  getTransformStatus(): Promise<TransformTableStatus[]>;

  /**
   * Reset transform state for specific table
   *
   * @remarks
   * Used for recovery after partial sync abort.
   * Truncates staging table and resets status to 'idle'.
   *
   * @param tableName - Name of the staging table to reset
   */
  resetTransform(tableName: string): Promise<void>;
}
