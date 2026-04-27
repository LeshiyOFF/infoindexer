/**
 * Resource Information Value Object
 *
 * @remarks
 * Immutable value object containing system resource information.
 * Includes total memory, available memory, and source of detection.
 *
 * Source types:
 * - CGROUP_V1: Docker cgroup v1
 * - CGROUP_V2: Docker cgroup v2
 * - OS: Bare metal / VM (os.totalmem())
 */
import { MemorySize } from './memory-size.vo';
export declare enum ResourceSource {
    CGROUP_V1 = "cgroup-v1",
    CGROUP_V2 = "cgroup-v2",
    OS = "os",
    UNKNOWN = "unknown"
}
/**
 * Resource info data
 */
export interface ResourceInfoData {
    readonly totalMemory: MemorySize;
    readonly availableMemory?: MemorySize;
    readonly source: ResourceSource;
    readonly isContainerized: boolean;
}
/**
 * Resource Info Value Object
 */
export declare class ResourceInfo {
    private readonly data;
    constructor(data: ResourceInfoData);
    /**
     * Get total memory
     */
    get totalMemory(): MemorySize;
    /**
     * Get available memory (total or explicitly set)
     */
    get availableMemory(): MemorySize;
    /**
     * Get detection source
     */
    get source(): ResourceSource;
    /**
     * Check if running in container
     */
    get isContainerized(): boolean;
    /**
     * Get total memory in GB
     */
    get totalMemoryGB(): number;
    /**
     * Create from bytes
     */
    static fromBytes(bytes: number, source?: ResourceSource): ResourceInfo;
    /**
     * Create from GB
     */
    static fromGB(gb: number, source?: ResourceSource): ResourceInfo;
    /**
     * Create with cgroup source
     */
    static fromCgroup(bytes: number, version: 1 | 2): ResourceInfo;
    /**
     * Create from OS (bare metal)
     */
    static fromOS(bytes: number): ResourceInfo;
    /**
     * Create with available memory override
     */
    static withAvailable(totalBytes: number, availableBytes: number, source: ResourceSource): ResourceInfo;
    /**
     * Check if memory is below threshold (GB)
     */
    isBelowThreshold(thresholdGB: number): boolean;
    /**
     * Calculate memory utilization (0.0 - 1.0)
     */
    utilization(): number;
    /**
     * Get description string
     */
    describe(): string;
    /**
     * Convert to JSON
     */
    toJSON(): ResourceInfoData & {
        totalMemoryGB: number;
        utilization: number;
    };
    private validate;
}
