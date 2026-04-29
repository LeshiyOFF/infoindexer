/**
 * Production Statistics DTO
 *
 * @remarks
 * Data Transfer Object for production table statistics.
 * Used by IProductionStorage.getStats() and monitoring.
 *
 * @pattern Data Transfer Object
 * @pattern Single Responsibility Principle
 */

/**
 * Row from system.parts query for table statistics
 *
 * @remarks
 * Strict typing for ClickHouse query results.
 * No any[] types allowed.
 */
export interface SystemPartsRow {
  readonly table_name: string;
  readonly rows: number;
  readonly bytes_on_disk: number;
}

/**
 * Raw data for ProductionStats creation
 *
 * @remarks
 * Optional max_updated_at from ClickHouse query.
 */
export interface ProductionStatsRawData {
  readonly table_name: string;
  readonly rows: number;
  readonly bytes_on_disk: number;
  readonly max_updated_at?: string;
}

/**
 * Production Statistics
 *
 * @remarks
 * Contains row count, disk size, and last update timestamp.
 */
export class ProductionStats {
  readonly tableName: string;
  readonly rowCount: number;
  readonly totalBytes: number;
  readonly lastUpdatedAt: Date;

  constructor(
    tableName: string,
    rowCount: number,
    totalBytes: number,
    lastUpdatedAt: Date
  ) {
    this.tableName = tableName;
    this.rowCount = rowCount;
    this.totalBytes = totalBytes;
    this.lastUpdatedAt = lastUpdatedAt;
  }

  /**
   * Create stats from ClickHouse query result
   *
   * @remarks
   * Factory method for creating from system.parts query.
   *
   * Expects result of:
   * SELECT
   *   table as table_name,
   *   sum(rows) as rows,
   *   sum(bytes_on_disk) as bytes_on_disk
   * FROM system.parts
   * WHERE table = {table_name: String}
   *   AND active = 1
   * GROUP BY table
   */
  static fromClickHouse(data: ProductionStatsRawData): ProductionStats {
    return new ProductionStats(
      data.table_name,
      data.rows,
      data.bytes_on_disk,
      data.max_updated_at ? new Date(data.max_updated_at) : new Date()
    );
  }

  /**
   * Format size to human readable string
   *
   * @remarks
   * Converts bytes to GB or MB.
   */
  get formattedSize(): string {
    const gb = this.totalBytes / (1024 * 1024 * 1024);
    const mb = this.totalBytes / (1024 * 1024);
    return gb > 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
  }

  /**
   * Check if table needs optimization
   *
   * @remarks
   * Optimization recommended if table size > 1GB.
   */
  needsOptimization(): boolean {
    return this.totalBytes > 1024 * 1024 * 1024;
  }
}
