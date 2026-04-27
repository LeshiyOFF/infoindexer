/**
 * Configuration Profile for resource-aware settings
 *
 * @remarks
 * Immutable value object containing ClickHouse settings for specific memory range.
 * Profiles are selected based on available system memory.
 *
 * Memory ranges:
 * - LOW: < 4GB (50% memory, 30s timeout, 1 thread)
 * - STANDARD: 4-16GB (60% memory, 120s timeout, 2 threads)
 * - HIGH: > 16GB (80% memory, 180s timeout, 4+ threads)
 */
import { ConfigProfileType } from './config-profile-type.enum';
/**
 * Configuration profile data
 */
export interface ConfigProfileData {
    readonly type: ConfigProfileType;
    readonly name: string;
    readonly description: string;
    readonly minMemoryGB: number;
    readonly maxMemoryGB: number;
    readonly memoryUtilization: number;
    readonly maxExecutionTime: number;
    readonly maxThreads: number;
    readonly batchSize: number;
    readonly warning?: string;
}
/**
 * Config Profile Value Object
 */
export declare class ConfigProfile {
    private readonly data;
    constructor(data: ConfigProfileData);
    /**
     * Get profile type
     */
    get type(): ConfigProfileType;
    /**
     * Get profile name
     */
    get name(): string;
    /**
     * Get profile description
     */
    get description(): string;
    /**
     * Get minimum memory for this profile (GB)
     */
    get minMemoryGB(): number;
    /**
     * Get maximum memory for this profile (GB)
     */
    get maxMemoryGB(): number;
    /**
     * Get memory utilization ratio (0.0 - 1.0)
     */
    get memoryUtilization(): number;
    /**
     * Get max execution time (seconds)
     */
    get maxExecutionTime(): number;
    /**
     * Get max threads
     */
    get maxThreads(): number;
    /**
     * Get batch size
     */
    get batchSize(): number;
    /**
     * Get warning message (if any)
     */
    get warning(): string | undefined;
    /**
     * Check if profile matches given memory size (GB)
     */
    matches(memoryGB: number): boolean;
    /**
     * Get raw data object
     */
    toJSON(): ConfigProfileData;
    private validate;
}
