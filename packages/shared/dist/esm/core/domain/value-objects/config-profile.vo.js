/**
 * Config Profile Value Object
 */
export class ConfigProfile {
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
