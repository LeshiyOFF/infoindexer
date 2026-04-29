/**
 * Memory Monitor Adapter
 *
 * @remarks
 * ClickHouse implementation of IMemoryMonitor port.
 * Queries system.metrics for memory usage statistics.
 *
 * @pattern Hexagonal / Ports & Adapters
 * @pattern Adapter Pattern
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IMemoryMonitor, MemorySnapshot } from '../../domain/ports/i-memory-monitor.port';
import { queryJson } from '../clickhouse-query.helper';

/**
 * Database row from system.metrics query
 */
interface MetricsDbRow {
  readonly metric: string;
  readonly value: string;
}

/**
 * Memory Monitor Adapter
 *
 * @remarks
 * Provides ClickHouse memory usage statistics.
 * Uses queryJson helper for type-safe queries.
 */
export class MemoryMonitorAdapter implements IMemoryMonitor {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Get current memory snapshot
   *
   * @remarks
   * Uses queryJson helper for type-safe query execution.
   */
  async getMemorySnapshot(): Promise<MemorySnapshot> {
    const rows = await queryJson<MetricsDbRow>(
      this.client,
      `
        SELECT
          metric,
          value
        FROM system.metrics
        WHERE metric IN ('max_memory_usage', 'memory_usage')
      `
    );

    let maxMemoryBytes = 0;
    let usedBytes = 0;

    for (const row of rows) {
      const value = BigInt(row.value);
      if (row.metric === 'max_memory_usage') {
        maxMemoryBytes = Number(value);
      } else if (row.metric === 'memory_usage') {
        usedBytes = Number(value);
      }
    }

    if (maxMemoryBytes === 0) {
      maxMemoryBytes = 6 * 1024 * 1024 * 1024;
    }

    const availableBytes = maxMemoryBytes - usedBytes;
    const usagePercent = maxMemoryBytes > 0 ? (usedBytes / maxMemoryBytes) * 100 : 0;

    return {
      usedBytes,
      availableBytes,
      totalBytes: maxMemoryBytes,
      usagePercent
    };
  }

  /**
   * Check if sufficient memory is available
   */
  async checkMemoryAvailable(requiredBytes: number): Promise<boolean> {
    const snapshot = await this.getMemorySnapshot();
    const availableWithMargin = snapshot.availableBytes * 0.8;
    return availableWithMargin >= requiredBytes;
  }
}
