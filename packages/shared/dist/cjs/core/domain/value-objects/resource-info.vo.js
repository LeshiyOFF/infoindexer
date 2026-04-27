"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceInfo = exports.ResourceSource = void 0;
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
const memory_size_vo_1 = require("./memory-size.vo");
var ResourceSource;
(function (ResourceSource) {
    ResourceSource["CGROUP_V1"] = "cgroup-v1";
    ResourceSource["CGROUP_V2"] = "cgroup-v2";
    ResourceSource["OS"] = "os";
    ResourceSource["UNKNOWN"] = "unknown";
})(ResourceSource || (exports.ResourceSource = ResourceSource = {}));
/**
 * Resource Info Value Object
 */
class ResourceInfo {
    data;
    constructor(data) {
        this.validate(data);
        this.data = Object.freeze({
            ...data,
            availableMemory: data.availableMemory ? data.availableMemory : data.totalMemory
        });
    }
    /**
     * Get total memory
     */
    get totalMemory() {
        return this.data.totalMemory;
    }
    /**
     * Get available memory (total or explicitly set)
     */
    get availableMemory() {
        return this.data.availableMemory;
    }
    /**
     * Get detection source
     */
    get source() {
        return this.data.source;
    }
    /**
     * Check if running in container
     */
    get isContainerized() {
        return this.data.isContainerized;
    }
    /**
     * Get total memory in GB
     */
    get totalMemoryGB() {
        return this.data.totalMemory.toGB();
    }
    /**
     * Create from bytes
     */
    static fromBytes(bytes, source = ResourceSource.UNKNOWN) {
        const isContainerized = source === ResourceSource.CGROUP_V1 || source === ResourceSource.CGROUP_V2;
        return new ResourceInfo({
            totalMemory: memory_size_vo_1.MemorySize.fromBytes(bytes),
            source,
            isContainerized
        });
    }
    /**
     * Create from GB
     */
    static fromGB(gb, source = ResourceSource.UNKNOWN) {
        const isContainerized = source === ResourceSource.CGROUP_V1 || source === ResourceSource.CGROUP_V2;
        return new ResourceInfo({
            totalMemory: memory_size_vo_1.MemorySize.fromGB(gb),
            source,
            isContainerized
        });
    }
    /**
     * Create with cgroup source
     */
    static fromCgroup(bytes, version) {
        const source = version === 1 ? ResourceSource.CGROUP_V1 : ResourceSource.CGROUP_V2;
        return new ResourceInfo({
            totalMemory: memory_size_vo_1.MemorySize.fromBytes(bytes),
            source,
            isContainerized: true
        });
    }
    /**
     * Create from OS (bare metal)
     */
    static fromOS(bytes) {
        return new ResourceInfo({
            totalMemory: memory_size_vo_1.MemorySize.fromBytes(bytes),
            source: ResourceSource.OS,
            isContainerized: false
        });
    }
    /**
     * Create with available memory override
     */
    static withAvailable(totalBytes, availableBytes, source) {
        const isContainerized = source === ResourceSource.CGROUP_V1 || source === ResourceSource.CGROUP_V2;
        return new ResourceInfo({
            totalMemory: memory_size_vo_1.MemorySize.fromBytes(totalBytes),
            availableMemory: memory_size_vo_1.MemorySize.fromBytes(availableBytes),
            source,
            isContainerized
        });
    }
    /**
     * Check if memory is below threshold (GB)
     */
    isBelowThreshold(thresholdGB) {
        return this.totalMemoryGB < thresholdGB;
    }
    /**
     * Calculate memory utilization (0.0 - 1.0)
     */
    utilization() {
        if (this.data.availableMemory && this.data.availableMemory.bytes < this.data.totalMemory.bytes) {
            return 1 - (this.data.availableMemory.bytes / this.data.totalMemory.bytes);
        }
        return 0;
    }
    /**
     * Get description string
     */
    describe() {
        const source = this.data.source.toUpperCase();
        const total = this.data.totalMemory.format();
        const available = this.data.availableMemory.format();
        const container = this.data.isContainerized ? ' (containerized)' : ' (bare metal)';
        return `${source}: ${total} total, ${available} available${container}`;
    }
    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            totalMemory: this.data.totalMemory,
            availableMemory: this.data.availableMemory,
            source: this.data.source,
            isContainerized: this.data.isContainerized,
            totalMemoryGB: this.totalMemoryGB,
            utilization: this.utilization()
        };
    }
    validate(data) {
        if (!data.totalMemory || data.totalMemory.isZero()) {
            throw new Error('totalMemory must be positive');
        }
        if (data.availableMemory && data.availableMemory.greaterThanOrEqualTo(data.totalMemory)) {
            throw new Error('availableMemory must be less than totalMemory');
        }
    }
}
exports.ResourceInfo = ResourceInfo;
