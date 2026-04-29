"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionStats = void 0;
/**
 * Production Statistics
 *
 * @remarks
 * Contains row count, disk size, and last update timestamp.
 */
class ProductionStats {
    tableName;
    rowCount;
    totalBytes;
    lastUpdatedAt;
    constructor(tableName, rowCount, totalBytes, lastUpdatedAt) {
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
    static fromClickHouse(data) {
        return new ProductionStats(data.table_name, data.rows, data.bytes_on_disk, data.max_updated_at ? new Date(data.max_updated_at) : new Date());
    }
    /**
     * Format size to human readable string
     *
     * @remarks
     * Converts bytes to GB or MB.
     */
    get formattedSize() {
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
    needsOptimization() {
        return this.totalBytes > 1024 * 1024 * 1024;
    }
}
exports.ProductionStats = ProductionStats;
