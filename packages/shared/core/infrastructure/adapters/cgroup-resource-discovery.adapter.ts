/**
 * Cgroup Resource Discovery Adapter
 *
 * @remarks
 * Detects system memory limits from cgroup (Docker/Kubernetes).
 * Supports both cgroup v1 and v2.
 *
 * Cgroup paths:
 * - v1: /sys/fs/cgroup/memory/memory.limit_in_bytes
 * - v2: /sys/fs/cgroup/memory.max
 *
 * Implements IResourceDiscoveryPort following Dependency Inversion.
 */
import { readFileSync } from 'fs';
import { IResourceDiscoveryPort } from '../ports/i-resource-discovery.port';
import { ResourceInfo, ResourceSource } from '../../domain/value-objects/resource-info.vo';

/**
 * Cgroup Resource Discovery Adapter
 */
export class CgroupResourceDiscoveryAdapter implements IResourceDiscoveryPort {
  private readonly CGROUP_V1_PATH = '/sys/fs/cgroup/memory/memory.limit_in_bytes';
  private readonly CGROUP_V2_PATH = '/sys/fs/cgroup/memory.max';

  /**
   * Detect resources from cgroup
   */
  detect(): ResourceInfo {
    const v2Result = this.tryReadCgroupV2();
    if (v2Result) {
      return v2Result;
    }

    const v1Result = this.tryReadCgroupV1();
    if (v1Result) {
      return v1Result;
    }

    throw new Error(
      'Cannot read cgroup memory limits. ' +
      `Tried: ${this.CGROUP_V1_PATH}, ${this.CGROUP_V2_PATH}`
    );
  }

  /**
   * Try reading cgroup v2 memory limit
   */
  private tryReadCgroupV2(): ResourceInfo | null {
    try {
      const content = this.readFile(this.CGROUP_V2_PATH).trim();

      if (content === 'max') {
        return null; // Unlimited, fallback to v1 or OS
      }

      const bytes = parseInt(content, 10);
      if (isNaN(bytes) || bytes <= 0) {
        return null;
      }

      return ResourceInfo.fromCgroup(bytes, 2);
    } catch {
      return null;
    }
  }

  /**
   * Try reading cgroup v1 memory limit
   */
  private tryReadCgroupV1(): ResourceInfo | null {
    try {
      const content = this.readFile(this.CGROUP_V1_PATH).trim();
      const bytes = parseInt(content, 10);

      if (isNaN(bytes) || bytes <= 0) {
        return null;
      }

      return ResourceInfo.fromCgroup(bytes, 1);
    } catch {
      return null;
    }
  }

  /**
   * Safely read file content
   */
  private readFile(path: string): string {
    return readFileSync(path, 'utf-8');
  }

  /**
   * Check if running in container
   */
  isContainerized(): boolean {
    try {
      this.readFile(this.CGROUP_V2_PATH);
      return true;
    } catch {
      try {
        this.readFile(this.CGROUP_V1_PATH);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Get cgroup version
   */
  getCgroupVersion(): 1 | 2 | null {
    try {
      this.readFile(this.CGROUP_V2_PATH);
      return 2;
    } catch {
      try {
        this.readFile(this.CGROUP_V1_PATH);
        return 1;
      } catch {
        return null;
      }
    }
  }
}
