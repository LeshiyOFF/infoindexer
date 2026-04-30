/**
 * Memory Monitor Adapter
 *
 * @remarks
 * ClickHouse implementation of IMemoryMonitor port.
 * Queries system.asynchronous_metrics for correct memory usage statistics.
 *
 * @pattern Hexagonal / Ports & Adapters
 * @pattern Adapter Pattern
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IMemoryMonitor, MemorySnapshot } from '../../domain/ports/i-memory-monitor.port';
/**
 * Memory Monitor Adapter
 *
 * @remarks
 * Provides ClickHouse memory usage statistics.
 * Uses queryJson helper for type-safe queries.
 *
 * Запрос использует system.asynchronous_metrics для получения корректных
 * данных о памяти сервера ClickHouse (в отличие от system.metrics).
 */
export declare class MemoryMonitorAdapter implements IMemoryMonitor {
    private readonly client;
    private readonly DEFAULT_MAX_MEMORY_GB;
    private readonly BYTES_PER_GB;
    constructor(client: ClickHouseClient);
    /**
     * Get current memory snapshot
     *
     * @remarks
     * Uses queryJson helper for type-safe query execution.
     *
     * Запрашивает memory_usage и calculates available memory.
     * Max memory берётся из server settings или использует дефолт.
     */
    getMemorySnapshot(): Promise<MemorySnapshot>;
    /**
     * Check if sufficient memory is available
     *
     * @remarks
     * Использует 80% margin для безопасности.
     *
     * @param requiredBytes - Amount of memory required in bytes
     * @returns true if sufficient memory available
     */
    checkMemoryAvailable(requiredBytes: number): Promise<boolean>;
    /**
     * Get memory usage from system.settings
     *
     * @remarks
     * Fallback метод если asynchronous_metrics не содержит memory_usage.
     *
     * @returns Memory usage in bytes
     */
    private getMemoryUsageFromSettings;
}
