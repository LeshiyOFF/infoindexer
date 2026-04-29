/**
 * Staging Statistics DTO
 *
 * @remarks
 * Data Transfer Object for staging table statistics.
 * Contains row count, memory usage, and transform status.
 *
 * @pattern Data Transfer Object
 * @pattern Single Responsibility Principle
 */
export class StagingStats {
  readonly tableName: string;
  readonly rowCount: number;
  readonly memoryBytes: number;
  readonly lastTransformAt: Date;
  readonly status: 'idle' | 'running' | 'error';

  constructor(
    tableName: string,
    rowCount: number,
    memoryBytes: number,
    lastTransformAt: Date,
    status: 'idle' | 'running' | 'error'
  ) {
    this.tableName = tableName;
    this.rowCount = rowCount;
    this.memoryBytes = memoryBytes;
    this.lastTransformAt = lastTransformAt;
    this.status = status;
  }

  /**
   * Create stats from raw database data
   *
   * @remarks
   * Factory method for creating from ClickHouse query results.
   */
  static fromRaw(data: {
    table_name: string;
    last_staging_count: number;
    last_transform_at: string;
    status: string;
  }): StagingStats {
    return new StagingStats(
      data.table_name,
      data.last_staging_count,
      0,
      new Date(data.last_transform_at),
      data.status as 'idle' | 'running' | 'error'
    );
  }

  /**
   * Check if transform is needed
   *
   * @remarks
   * Transform is needed when row count exceeds threshold
   * and status is not 'running'.
   *
   * @param threshold - Minimum row count to trigger transform
   * @returns true if transform needed, false otherwise
   */
  needsTransform(threshold: number): boolean {
    return this.rowCount >= threshold && this.status !== 'running';
  }

  /**
   * Format memory size to human readable string
   *
   * @remarks
   * Converts bytes to MB or GB.
   */
  get formattedMemory(): string {
    const gb = this.memoryBytes / (1024 * 1024 * 1024);
    const mb = this.memoryBytes / (1024 * 1024);
    return gb > 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
  }
}
