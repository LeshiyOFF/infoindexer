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
import type { StagingConfig } from '../value-objects/staging-config.vo';

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
  readonly lastTransformAt: Date;
  readonly errorMessage?: string;
}

/**
 * Transform Service Port
 *
 * @remarks
 * Defines contract for staging → production transformation.
 *
 * Responsibilities:
 * - Check if transform is needed for staging tables
 * - Execute transform for specific table
 * - Report transform status for monitoring
 * - Reset transform state for recovery
 *
 * Used by:
 * - TransformPollingWorker (automatic periodic transforms)
 * - Manual operations (admin interface)
 * - Recovery procedures (after abort/failure)
 */
export interface ITransformService {
  /**
   * Check and execute transform if needed
   *
   * @remarks
   * Iterates through all staging tables and triggers transform
   * for tables that exceed the configured threshold.
   *
   * @returns Array of transform results (one per processed table)
   */
  transformIfNeeded(): Promise<TransformResult[]>;

  /**
   * Execute transform for specific table
   *
   * @remarks
   * Performs full transform cycle:
   * 1. Check memory availability
   * 2. Fetch data from staging
   * 3. Aggregate in memory
   * 4. Insert to production
   * 5. Truncate staging
   * 6. Update transform state
   *
   * @param tableName - Name of the staging table to transform
   * @returns Transform result with metrics
   */
  transformTable(tableName: string): Promise<TransformResult>;

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
