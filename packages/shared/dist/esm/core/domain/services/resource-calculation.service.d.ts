import { ResourceInfo } from '../value-objects/resource-info.vo';
import { ConfigProfile } from '../value-objects/config-profile.vo';
/**
 * Calculated ClickHouse configuration
 */
export interface CalculatedConfig {
    readonly maxMemoryUsage: string;
    readonly maxExecutionTime: number;
    readonly maxThreads: number;
    readonly batchSize: number;
    readonly profile: ConfigProfile;
    readonly totalMemoryGB: number;
    readonly memoryUtilization: number;
}
/**
 * Resource Calculation Service
 */
export declare class ResourceCalculationService {
    private readonly MIN_MEMORY_GB;
    /**
     * Calculate ClickHouse configuration for given resources
     *
     * @param resources - Detected system resources
     * @param profile - Selected config profile
     * @returns Calculated configuration values
     */
    calculate(resources: ResourceInfo, profile: ConfigProfile): CalculatedConfig;
    /**
     * Calculate safe batch size for memory
     *
     * @param totalMemoryGB - Total memory in GB
     * @param targetBatches - Desired number of batches (default 32)
     * @returns Batch size in records
     */
    calculateBatchSize(totalMemoryGB: number, targetBatches?: number): number;
    /**
     * Calculate max execution time based on memory
     *
     * @param memoryGB - Available memory in GB
     * @returns Max execution time in seconds
     */
    calculateMaxExecutionTime(memoryGB: number): number;
    /**
     * Calculate max threads based on memory
     *
     * @param memoryGB - Available memory in GB
     * @returns Max threads
     */
    calculateMaxThreads(memoryGB: number): number;
    /**
     * Calculate memory utilization ratio
     *
     * @param memoryGB - Available memory in GB
     * @returns Utilization ratio (0.0 - 1.0)
     */
    calculateMemoryUtilization(memoryGB: number): number;
    /**
     * Validate minimum memory requirements
     *
     * @param resources - Detected system resources
     * @returns true if requirements met
     * @throws Error if insufficient memory
     */
    validateMinimumRequirements(resources: ResourceInfo): boolean;
    /**
     * Get recommended action for low memory
     *
     * @param resources - Detected system resources
     * @returns Action recommendation
     */
    getRecommendation(resources: ResourceInfo): string;
}
