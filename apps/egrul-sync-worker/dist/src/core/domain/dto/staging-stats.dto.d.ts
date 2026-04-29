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
export declare class StagingStats {
    readonly tableName: string;
    readonly rowCount: number;
    readonly memoryBytes: number;
    readonly lastTransformAt: Date;
    readonly status: 'idle' | 'running' | 'error';
    constructor(tableName: string, rowCount: number, memoryBytes: number, lastTransformAt: Date, status: 'idle' | 'running' | 'error');
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
    }): StagingStats;
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
    needsTransform(threshold: number): boolean;
    /**
     * Format memory size to human readable string
     *
     * @remarks
     * Converts bytes to MB or GB.
     */
    get formattedMemory(): string;
}
