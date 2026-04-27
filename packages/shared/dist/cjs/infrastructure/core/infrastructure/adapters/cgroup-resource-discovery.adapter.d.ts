import { IResourceDiscoveryPort } from '../ports/i-resource-discovery.port';
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';
/**
 * Cgroup Resource Discovery Adapter
 */
export declare class CgroupResourceDiscoveryAdapter implements IResourceDiscoveryPort {
    private readonly CGROUP_V1_PATH;
    private readonly CGROUP_V2_PATH;
    /**
     * Detect resources from cgroup
     */
    detect(): ResourceInfo;
    /**
     * Try reading cgroup v2 memory limit
     */
    private tryReadCgroupV2;
    /**
     * Try reading cgroup v1 memory limit
     */
    private tryReadCgroupV1;
    /**
     * Safely read file content
     */
    private readFile;
    /**
     * Check if running in container
     */
    isContainerized(): boolean;
    /**
     * Get cgroup version
     */
    getCgroupVersion(): 1 | 2 | null;
}
