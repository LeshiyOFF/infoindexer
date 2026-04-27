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

export enum ResourceSource {
  CGROUP_V1 = 'cgroup-v1',
  CGROUP_V2 = 'cgroup-v2',
  OS = 'os',
  UNKNOWN = 'unknown'
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
export class ResourceInfo {
  private readonly data: ResourceInfoData;

  constructor(data: ResourceInfoData) {
    this.validate(data);
    this.data = Object.freeze({
      ...data,
      availableMemory: data.availableMemory ? data.availableMemory : data.totalMemory
    });
  }

  /**
   * Get total memory
   */
  get totalMemory(): MemorySize {
    return this.data.totalMemory;
  }

  /**
   * Get available memory (total or explicitly set)
   */
  get availableMemory(): MemorySize {
    return this.data.availableMemory!;
  }

  /**
   * Get detection source
   */
  get source(): ResourceSource {
    return this.data.source;
  }

  /**
   * Check if running in container
   */
  get isContainerized(): boolean {
    return this.data.isContainerized;
  }

  /**
   * Get total memory in GB
   */
  get totalMemoryGB(): number {
    return this.data.totalMemory.toGB();
  }

  /**
   * Create from bytes
   */
  static fromBytes(bytes: number, source: ResourceSource = ResourceSource.UNKNOWN): ResourceInfo {
    const isContainerized = source === ResourceSource.CGROUP_V1 || source === ResourceSource.CGROUP_V2;
    return new ResourceInfo({
      totalMemory: MemorySize.fromBytes(bytes),
      source,
      isContainerized
    });
  }

  /**
   * Create from GB
   */
  static fromGB(gb: number, source: ResourceSource = ResourceSource.UNKNOWN): ResourceInfo {
    const isContainerized = source === ResourceSource.CGROUP_V1 || source === ResourceSource.CGROUP_V2;
    return new ResourceInfo({
      totalMemory: MemorySize.fromGB(gb),
      source,
      isContainerized
    });
  }

  /**
   * Create with cgroup source
   */
  static fromCgroup(bytes: number, version: 1 | 2): ResourceInfo {
    const source = version === 1 ? ResourceSource.CGROUP_V1 : ResourceSource.CGROUP_V2;
    return new ResourceInfo({
      totalMemory: MemorySize.fromBytes(bytes),
      source,
      isContainerized: true
    });
  }

  /**
   * Create from OS (bare metal)
   */
  static fromOS(bytes: number): ResourceInfo {
    return new ResourceInfo({
      totalMemory: MemorySize.fromBytes(bytes),
      source: ResourceSource.OS,
      isContainerized: false
    });
  }

  /**
   * Create with available memory override
   */
  static withAvailable(
    totalBytes: number,
    availableBytes: number,
    source: ResourceSource
  ): ResourceInfo {
    const isContainerized = source === ResourceSource.CGROUP_V1 || source === ResourceSource.CGROUP_V2;
    return new ResourceInfo({
      totalMemory: MemorySize.fromBytes(totalBytes),
      availableMemory: MemorySize.fromBytes(availableBytes),
      source,
      isContainerized
    });
  }

  /**
   * Check if memory is below threshold (GB)
   */
  isBelowThreshold(thresholdGB: number): boolean {
    return this.totalMemoryGB < thresholdGB;
  }

  /**
   * Calculate memory utilization (0.0 - 1.0)
   */
  utilization(): number {
    if (this.data.availableMemory && this.data.availableMemory.bytes < this.data.totalMemory.bytes) {
      return 1 - (this.data.availableMemory.bytes / this.data.totalMemory.bytes);
    }
    return 0;
  }

  /**
   * Get description string
   */
  describe(): string {
    const source = this.data.source.toUpperCase();
    const total = this.data.totalMemory.format();
    const available = this.data.availableMemory!.format();
    const container = this.data.isContainerized ? ' (containerized)' : ' (bare metal)';
    return `${source}: ${total} total, ${available} available${container}`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): ResourceInfoData & { totalMemoryGB: number; utilization: number } {
    return {
      totalMemory: this.data.totalMemory,
      availableMemory: this.data.availableMemory,
      source: this.data.source,
      isContainerized: this.data.isContainerized,
      totalMemoryGB: this.totalMemoryGB,
      utilization: this.utilization()
    };
  }

  private validate(data: ResourceInfoData): void {
    if (!data.totalMemory || data.totalMemory.isZero()) {
      throw new Error('totalMemory must be positive');
    }
    if (data.availableMemory && data.availableMemory.greaterThanOrEqualTo(data.totalMemory)) {
      throw new Error('availableMemory must be less than totalMemory');
    }
  }
}
