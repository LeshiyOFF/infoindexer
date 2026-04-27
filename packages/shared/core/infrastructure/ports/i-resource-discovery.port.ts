/**
 * Port for Resource Discovery
 *
 * @remarks
 * Abstracts the detection of system resources (memory, CPU).
 * Different implementations can read from cgroup, OS, or cloud providers.
 *
 * Follows Dependency Inversion: high-level modules depend on this port,
 * not on concrete implementations.
 */
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';

/**
 * Resource Discovery Port
 */
export interface IResourceDiscoveryPort {
  /**
   * Detect available system resources
   *
   * @returns ResourceInfo with detected memory and source
   * @throws Error if detection fails
   *
   * @example
   * ```ts
   * const info = await discovery.detect();
   * console.log(info.totalMemoryGB); // 8.0
   * ```
   */
  detect(): Promise<ResourceInfo> | ResourceInfo;
}
