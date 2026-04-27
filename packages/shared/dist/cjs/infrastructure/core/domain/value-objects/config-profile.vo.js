"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigProfile = exports.ConfigProfileType = void 0;
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
var ConfigProfileType;
(function (ConfigProfileType) {
    ConfigProfileType["LOW"] = "low";
    ConfigProfileType["STANDARD"] = "standard";
    ConfigProfileType["HIGH"] = "high";
})(ConfigProfileType || (exports.ConfigProfileType = ConfigProfileType = {}));
/**
 * Config Profile Value Object
 */
class ConfigProfile {
    data;
    constructor(data) {
        this.validate(data);
        this.data = Object.freeze({ ...data });
    }
    /**
     * Get profile type
     */
    get type() {
        return this.data.type;
    }
    /**
     * Get profile name
     */
    get name() {
        return this.data.name;
    }
    /**
     * Get profile description
     */
    get description() {
        return this.data.description;
    }
    /**
     * Get minimum memory for this profile (GB)
     */
    get minMemoryGB() {
        return this.data.minMemoryGB;
    }
    /**
     * Get maximum memory for this profile (GB)
     */
    get maxMemoryGB() {
        return this.data.maxMemoryGB;
    }
    /**
     * Get memory utilization ratio (0.0 - 1.0)
     */
    get memoryUtilization() {
        return this.data.memoryUtilization;
    }
    /**
     * Get max execution time (seconds)
     */
    get maxExecutionTime() {
        return this.data.maxExecutionTime;
    }
    /**
     * Get max threads
     */
    get maxThreads() {
        return this.data.maxThreads;
    }
    /**
     * Get batch size
     */
    get batchSize() {
        return this.data.batchSize;
    }
    /**
     * Get warning message (if any)
     */
    get warning() {
        return this.data.warning;
    }
    /**
     * Check if profile matches given memory size (GB)
     */
    matches(memoryGB) {
        return memoryGB >= this.data.minMemoryGB &&
            (this.data.maxMemoryGB === Infinity || memoryGB < this.data.maxMemoryGB);
    }
    /**
     * Get raw data object
     */
    toJSON() {
        return { ...this.data };
    }
    /**
     * Predefined profiles
     */
    static LOW = new ConfigProfile({
        type: ConfigProfileType.LOW,
        name: 'Low Memory',
        description: 'For systems with less than 4GB RAM',
        minMemoryGB: 0,
        maxMemoryGB: 4,
        memoryUtilization: 0.5,
        maxExecutionTime: 30,
        maxThreads: 1,
        batchSize: 100000,
        warning: 'Running in low-memory mode. Performance is significantly degraded.'
    });
    static STANDARD = new ConfigProfile({
        type: ConfigProfileType.STANDARD,
        name: 'Standard',
        description: 'For systems with 4-16GB RAM',
        minMemoryGB: 4,
        maxMemoryGB: 16,
        memoryUtilization: 0.6,
        maxExecutionTime: 120,
        maxThreads: 2,
        batchSize: 1000000
    });
    static HIGH = new ConfigProfile({
        type: ConfigProfileType.HIGH,
        name: 'High Memory',
        description: 'For systems with more than 16GB RAM',
        minMemoryGB: 16,
        maxMemoryGB: Infinity,
        memoryUtilization: 0.8,
        maxExecutionTime: 180,
        maxThreads: 4,
        batchSize: 5000000
    });
    /**
     * Select profile based on memory size (GB)
     */
    static selectFor(memoryGB) {
        if (memoryGB < 4) {
            return ConfigProfile.LOW;
        }
        if (memoryGB < 16) {
            return ConfigProfile.STANDARD;
        }
        return ConfigProfile.HIGH;
    }
    /**
     * Get all available profiles
     */
    static all() {
        return [ConfigProfile.LOW, ConfigProfile.STANDARD, ConfigProfile.HIGH];
    }
    validate(data) {
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
exports.ConfigProfile = ConfigProfile;
