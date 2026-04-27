/**
 * Memory Size Value Object
 *
 * @remarks
 * Immutable value object for type-safe memory size operations.
 * Provides conversion between bytes, MB, and GB.
 * Follows SRP: responsible only for memory size representation.
 *
 * @example
 * ```ts
 * const size = MemorySize.fromGB(8);
 * console.log(size.toBytes()); // 8589934592
 * console.log(size.toGB());    // 8
 * ```
 */
export declare class MemorySize {
    readonly bytes: number;
    private readonly BYTES_IN_MB;
    private readonly BYTES_IN_GB;
    private constructor();
    /**
     * Create MemorySize from bytes
     */
    static fromBytes(bytes: number): MemorySize;
    /**
     * Create MemorySize from megabytes
     */
    static fromMB(mb: number): MemorySize;
    /**
     * Create MemorySize from gigabytes
     */
    static fromGB(gb: number): MemorySize;
    /**
     * Convert to bytes
     */
    toBytes(): number;
    /**
     * Convert to megabytes
     */
    toMB(): number;
    /**
     * Convert to gigabytes
     */
    toGB(): number;
    /**
     * Get percentage of another memory size
     */
    percentageOf(total: MemorySize): number;
    /**
     * Multiply by factor
     */
    multiply(factor: number): MemorySize;
    /**
     * Add another memory size
     */
    add(other: MemorySize): MemorySize;
    /**
     * Subtract another memory size
     */
    subtract(other: MemorySize): MemorySize;
    /**
     * Check if is zero
     */
    isZero(): boolean;
    /**
     * Check if is less than other
     */
    lessThan(other: MemorySize): boolean;
    /**
     * Check if is greater than or equal to other
     */
    greaterThanOrEqualTo(other: MemorySize): boolean;
    /**
     * Format as human-readable string
     */
    format(): string;
}
