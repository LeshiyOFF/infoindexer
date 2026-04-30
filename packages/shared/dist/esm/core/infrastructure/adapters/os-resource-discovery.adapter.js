/**
 * OS Resource Discovery Adapter
 *
 * @remarks
 * Detects system memory from Node.js os module.
 * Fallback adapter for non-containerized environments.
 *
 * Implements IResourceDiscoveryPort following Dependency Inversion.
 */
import * as os from 'os';
import { ResourceInfo, ResourceSource } from '../../domain/value-objects/resource-info.vo';
import { MemorySize } from '../../domain/value-objects/memory-size.vo';
/**
 * OS Resource Discovery Adapter
 */
export class OSResourceDiscoveryAdapter {
    /**
     * Detect resources from OS
     */
    detect() {
        const totalBytes = os.totalmem();
        const freeBytes = os.freemem();
        return ResourceInfo.withAvailable(totalBytes, freeBytes, ResourceSource.OS);
    }
    /**
     * Get total system memory
     */
    getTotalMemory() {
        return MemorySize.fromBytes(os.totalmem());
    }
    /**
     * Get free system memory
     */
    getFreeMemory() {
        return MemorySize.fromBytes(os.freemem());
    }
    /**
     * Get memory utilization (0.0 - 1.0)
     */
    getMemoryUtilization() {
        const total = os.totalmem();
        const free = os.freemem();
        return (total - free) / total;
    }
    /**
     * Get number of CPUs
     */
    getCPUCount() {
        return os.cpus().length;
    }
}
