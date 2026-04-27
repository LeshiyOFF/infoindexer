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
import { IResourceDiscoveryPort } from '../ports/i-resource-discovery.port';
import { ResourceInfo, ResourceSource } from '../../domain/value-objects/resource-info.vo';
import { MemorySize } from '../../domain/value-objects/memory-size.vo';

/**
 * OS Resource Discovery Adapter
 */
export class OSResourceDiscoveryAdapter implements IResourceDiscoveryPort {
  /**
   * Detect resources from OS
   */
  detect(): ResourceInfo {
    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();

    return ResourceInfo.withAvailable(
      totalBytes,
      freeBytes,
      ResourceSource.OS
    );
  }

  /**
   * Get total system memory
   */
  getTotalMemory(): MemorySize {
    return MemorySize.fromBytes(os.totalmem());
  }

  /**
   * Get free system memory
   */
  getFreeMemory(): MemorySize {
    return MemorySize.fromBytes(os.freemem());
  }

  /**
   * Get memory utilization (0.0 - 1.0)
   */
  getMemoryUtilization(): number {
    const total = os.totalmem();
    const free = os.freemem();
    return (total - free) / total;
  }

  /**
   * Get number of CPUs
   */
  getCPUCount(): number {
    return os.cpus().length;
  }
}
