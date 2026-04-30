"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryMonitorAdapter = void 0;
const clickhouse_query_helper_1 = require("../clickhouse-query.helper");
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
class MemoryMonitorAdapter {
    client;
    DEFAULT_MAX_MEMORY_GB = 6;
    BYTES_PER_GB = 1024 * 1024 * 1024;
    constructor(client) {
        this.client = client;
    }
    /**
     * Get current memory snapshot
     *
     * @remarks
     * Uses queryJson helper for type-safe query execution.
     *
     * Запрашивает memory_usage и calculates available memory.
     * Max memory берётся из server settings или использует дефолт.
     */
    async getMemorySnapshot() {
        const rows = await (0, clickhouse_query_helper_1.queryJson)(this.client, `
        SELECT
          metric,
          value
        FROM system.asynchronous_metrics
        WHERE metric LIKE 'Memory%'
           OR metric = 'memory_usage'
      `);
        let usedBytes = 0;
        let maxMemoryBytes = this.DEFAULT_MAX_MEMORY_GB * this.BYTES_PER_GB;
        for (const row of rows) {
            const value = BigInt(row.value);
            if (row.metric === 'memory_usage' || row.metric === 'MemoryUsed') {
                usedBytes = Number(value);
            }
        }
        // Fallback: если memory_usage не найден, пробуем через settings
        if (usedBytes === 0) {
            usedBytes = await this.getMemoryUsageFromSettings();
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
     *
     * @remarks
     * Использует 80% margin для безопасности.
     *
     * @param requiredBytes - Amount of memory required in bytes
     * @returns true if sufficient memory available
     */
    async checkMemoryAvailable(requiredBytes) {
        const snapshot = await this.getMemorySnapshot();
        const availableWithMargin = snapshot.availableBytes * 0.8;
        return availableWithMargin >= requiredBytes;
    }
    /**
     * Get memory usage from system.settings
     *
     * @remarks
     * Fallback метод если asynchronous_metrics не содержит memory_usage.
     *
     * @returns Memory usage in bytes
     */
    async getMemoryUsageFromSettings() {
        try {
            const rows = await (0, clickhouse_query_helper_1.queryJson)(this.client, `
          SELECT value
          FROM system.settings
          WHERE name = 'max_memory_usage'
          LIMIT 1
        `);
            if (rows.length > 0) {
                return Number(BigInt(rows[0].value));
            }
        }
        catch {
            // Игнорируем ошибки, fallback на 0
        }
        return 0;
    }
}
exports.MemoryMonitorAdapter = MemoryMonitorAdapter;
