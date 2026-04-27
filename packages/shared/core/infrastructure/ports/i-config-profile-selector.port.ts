/**
 * Port for Config Profile Selection
 *
 * @remarks
 * Abstracts the selection of configuration profile based on available resources.
 * Can be extended to consider CPU, disk, or custom factors.
 *
 * Follows Dependency Inversion: services depend on this port,
 * not on concrete selection logic.
 */
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';
import { ConfigProfile } from '../../domain/value-objects/config-profile.vo';

/**
 * Config Profile Selector Port
 */
export interface IConfigProfileSelectorPort {
  /**
   * Select appropriate config profile for given resources
   *
   * @param resources - Detected system resources
   * @returns Config profile matching the resources
   *
   * @example
   * ```ts
   * const profile = selector.select(resources);
   * console.log(profile.name); // 'Low Memory'
   * ```
   */
  select(resources: ResourceInfo): ConfigProfile;
}
