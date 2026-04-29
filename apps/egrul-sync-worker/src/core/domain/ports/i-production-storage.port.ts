/**
 * Port: IProductionStorage
 *
 * @remarks
 * Port for writing to production tables.
 * Production tables are populated via Transform Service (Iteration 2).
 *
 * Production tables from Migration 018:
 * - companies_production (aggregated companies)
 * - directors_production (aggregated directors)
 * - founders_production (aggregated founders)
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Dependency Inversion Principle
 */
import type { ProductionStats } from '../dto/production-stats.dto';

/**
 * Production company row (aggregated)
 *
 * @remarks
 * Contains latest data per company (argMax by updated_at).
 */
export interface ProductionCompanyRow {
  readonly inn: string;
  readonly name: string;
  readonly status: string;
  readonly address: string;
  readonly updated_at: Date;
}

/**
 * Production director row (aggregated)
 *
 * @remarks
 * Contains unique directors per INN.
 */
export interface ProductionDirectorRow {
  readonly inn: string;
  readonly director_name: string;
  readonly updated_at: Date;
}

/**
 * Production founder row (aggregated)
 *
 * @remarks
 * Contains unique founders per INN.
 */
export interface ProductionFounderRow {
  readonly inn: string;
  readonly founder_name: string;
  readonly updated_at: Date;
}

/**
 * Production Storage Port
 *
 * @remarks
 * Defines contract for production table operations.
 * Follows Interface Segregation: focused, single-purpose interface.
 */
export interface IProductionStorage {
  /**
   * Insert aggregated companies
   *
   * @remarks
   * Used by Transform Service to write aggregated data.
   * Replaces MV auto-aggregation from egrul_companies_raw.
   *
   * @param companies - Array of aggregated company records
   * @returns Number of records inserted
   */
  insertCompanies(companies: readonly ProductionCompanyRow[]): Promise<number>;

  /**
   * Insert aggregated directors
   *
   * @remarks
   * Used by Transform Service to write aggregated data.
   * Replaces MV auto-aggregation from egrul_directors_denormalized.
   *
   * @param directors - Array of aggregated director records
   * @returns Number of records inserted
   */
  insertDirectors(directors: readonly ProductionDirectorRow[]): Promise<number>;

  /**
   * Insert aggregated founders
   *
   * @remarks
   * Used by Transform Service to write aggregated data.
   * Replaces MV auto-aggregation from egrul_founders_denormalized.
   *
   * @param founders - Array of aggregated founder records
   * @returns Number of records inserted
   */
  insertFounders(founders: readonly ProductionFounderRow[]): Promise<number>;

  /**
   * Get production table statistics
   *
   * @remarks
   * Used for monitoring and health checks.
   *
   * @param tableName - Name of the production table
   * @returns Statistics including row count, disk size, last update
   */
  getStats(tableName: string): Promise<ProductionStats>;
}
