import { IResourceDiscoveryPort } from '../ports/i-resource-discovery.port';
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';
import { MemorySize } from '../../domain/value-objects/memory-size.vo';
/**
 * OS Resource Discovery Adapter
 */
export declare class OSResourceDiscoveryAdapter implements IResourceDiscoveryPort {
    /**
     * Detect resources from OS
     */
    detect(): ResourceInfo;
    /**
     * Get total system memory
     */
    getTotalMemory(): MemorySize;
    /**
     * Get free system memory
     */
    getFreeMemory(): MemorySize;
    /**
     * Get memory utilization (0.0 - 1.0)
     */
    getMemoryUtilization(): number;
    /**
     * Get number of CPUs
     */
    getCPUCount(): number;
}
