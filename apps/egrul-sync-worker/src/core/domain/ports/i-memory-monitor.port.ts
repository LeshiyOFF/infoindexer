/**
 * Port: IMemoryMonitor
 *
 * @remarks
 * Interface for monitoring ClickHouse memory usage.
 * Moved from Iteration 3 for use in Transform Service (Iteration 2).
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Dependency Inversion Principle
 */

/**
 * Memory Snapshot
 *
 * @remarks
 * Contains current memory usage statistics.
 */
export interface MemorySnapshot {
  /** Bytes currently used by ClickHouse */
  readonly usedBytes: number;
  /** Bytes available for operations */
  readonly availableBytes: number;
  /** Total bytes allocated to ClickHouse */
  readonly totalBytes: number;
  /** Usage percentage (0-100) */
  readonly usagePercent: number;
}

/**
 * Memory Monitor Port
 *
 * @remarks
 * Defines contract for memory monitoring operations.
 * Follows Interface Segregation: focused, single-purpose interface.
 *
 * Used by Transform Service to prevent OOM during aggregation.
 */
export interface IMemoryMonitor {
  /**
   * Get current memory snapshot
   *
   * @remarks
   * Queries ClickHouse system tables for memory usage.
   *
   * @returns Current memory snapshot
   */
  getMemorySnapshot(): Promise<MemorySnapshot>;

  /**
   * Check if sufficient memory is available
   *
   * @remarks
   * Used to prevent OOM by checking before operations.
   *
   * @param requiredBytes - Amount of memory required in bytes
   * @returns true if sufficient memory available, false otherwise
   */
  checkMemoryAvailable(requiredBytes: number): Promise<boolean>;
}
