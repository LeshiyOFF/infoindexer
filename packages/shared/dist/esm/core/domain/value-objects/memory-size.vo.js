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
export class MemorySize {
    bytes;
    BYTES_IN_MB = 1024 * 1024;
    BYTES_IN_GB = 1024 * 1024 * 1024;
    constructor(bytes) {
        this.bytes = bytes;
        if (bytes < 0) {
            throw new Error(`Memory size cannot be negative: ${bytes}`);
        }
    }
    /**
     * Create MemorySize from bytes
     */
    static fromBytes(bytes) {
        return new MemorySize(bytes);
    }
    /**
     * Create MemorySize from megabytes
     */
    static fromMB(mb) {
        return new MemorySize(mb * 1024 * 1024);
    }
    /**
     * Create MemorySize from gigabytes
     */
    static fromGB(gb) {
        return new MemorySize(gb * 1024 * 1024 * 1024);
    }
    /**
     * Convert to bytes
     */
    toBytes() {
        return this.bytes;
    }
    /**
     * Convert to megabytes
     */
    toMB() {
        return this.bytes / this.BYTES_IN_MB;
    }
    /**
     * Convert to gigabytes
     */
    toGB() {
        return this.bytes / this.BYTES_IN_GB;
    }
    /**
     * Get percentage of another memory size
     */
    percentageOf(total) {
        return (this.bytes / total.bytes) * 100;
    }
    /**
     * Multiply by factor
     */
    multiply(factor) {
        return new MemorySize(Math.floor(this.bytes * factor));
    }
    /**
     * Add another memory size
     */
    add(other) {
        return new MemorySize(this.bytes + other.bytes);
    }
    /**
     * Subtract another memory size
     */
    subtract(other) {
        return new MemorySize(this.bytes - other.bytes);
    }
    /**
     * Check if is zero
     */
    isZero() {
        return this.bytes === 0;
    }
    /**
     * Check if is less than other
     */
    lessThan(other) {
        return this.bytes < other.bytes;
    }
    /**
     * Check if is greater than or equal to other
     */
    greaterThanOrEqualTo(other) {
        return this.bytes >= other.bytes;
    }
    /**
     * Format as human-readable string
     */
    format() {
        const gb = this.toGB();
        if (gb >= 1) {
            return `${gb.toFixed(1)}GB`;
        }
        const mb = this.toMB();
        if (mb >= 1) {
            return `${mb.toFixed(0)}MB`;
        }
        return `${this.bytes}B`;
    }
}
