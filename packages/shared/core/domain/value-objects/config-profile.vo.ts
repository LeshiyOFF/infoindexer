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
  readonly memoryUtilization: number; // 0.0 - 1.0
  readonly maxExecutionTime: number; // seconds
  readonly maxThreads: number;
  readonly batchSize: number;
  readonly warning?: string;
}

/**
 * Config Profile Value Object
 */
export class ConfigProfile {
  private readonly data: ConfigProfileData;

  constructor(data: ConfigProfileData) {
    this.validate(data);
    this.data = Object.freeze({ ...data });
  }

  /**
   * Get profile type
   */
  get type(): ConfigProfileType {
    return this.data.type;
  }

  /**
   * Get profile name
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * Get profile description
   */
  get description(): string {
    return this.data.description;
  }

  /**
   * Get minimum memory for this profile (GB)
   */
  get minMemoryGB(): number {
    return this.data.minMemoryGB;
  }

  /**
   * Get maximum memory for this profile (GB)
   */
  get maxMemoryGB(): number {
    return this.data.maxMemoryGB;
  }

  /**
   * Get memory utilization ratio (0.0 - 1.0)
   */
  get memoryUtilization(): number {
    return this.data.memoryUtilization;
  }

  /**
   * Get max execution time (seconds)
   */
  get maxExecutionTime(): number {
    return this.data.maxExecutionTime;
  }

  /**
   * Get max threads
   */
  get maxThreads(): number {
    return this.data.maxThreads;
  }

  /**
   * Get batch size
   */
  get batchSize(): number {
    return this.data.batchSize;
  }

  /**
   * Get warning message (if any)
   */
  get warning(): string | undefined {
    return this.data.warning;
  }

  /**
   * Check if profile matches given memory size (GB)
   */
  matches(memoryGB: number): boolean {
    return memoryGB >= this.data.minMemoryGB &&
           (this.data.maxMemoryGB === Infinity || memoryGB < this.data.maxMemoryGB);
  }

  /**
   * Get raw data object
   */
  toJSON(): ConfigProfileData {
    return { ...this.data };
  }

  private validate(data: ConfigProfileData): void {
    if (data.minMemoryGB < 0) {
      throw new Error(`minMemoryGB cannot be negative: ${data.minMemoryGB}`);
    }
    if (data.maxMemoryGB < data.minMemoryGB && data.maxMemoryGB !== Infinity) {
      throw new Error(`maxMemoryGB (${data.maxMemoryGB}) must be >= minMemoryGB (${data.minMemoryGB})`);
    }
    if (data.memoryUtilization <= 0 || data.memoryUtilization > 1) {
      throw new Error(`memoryUtilization must be in (0, 1]: ${data.memoryUtilization}`);
    }
    if (data.maxExecutionTime <= 0) {
      throw new Error(`maxExecutionTime must be positive: ${data.maxExecutionTime}`);
    }
    if (data.maxThreads <= 0) {
      throw new Error(`maxThreads must be positive: ${data.maxThreads}`);
    }
    if (data.batchSize <= 0) {
      throw new Error(`batchSize must be positive: ${data.batchSize}`);
    }
  }
}
