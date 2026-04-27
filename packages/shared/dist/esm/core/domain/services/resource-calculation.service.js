/**
 * Resource Calculation Service
 */
export class ResourceCalculationService {
    MIN_MEMORY_GB = 2;
    /**
     * Calculate ClickHouse configuration for given resources
     *
     * @param resources - Detected system resources
     * @param profile - Selected config profile
     * @returns Calculated configuration values
     */
    calculate(resources, profile) {
        const totalMemory = resources.totalMemory;
        const maxMemoryBytes = totalMemory.multiply(profile.memoryUtilization);
        const memoryUtilization = profile.memoryUtilization;
        return {
            maxMemoryUsage: Math.floor(maxMemoryBytes.toBytes()).toString(),
            maxExecutionTime: profile.maxExecutionTime,
            maxThreads: profile.maxThreads,
            batchSize: profile.batchSize,
            profile,
            totalMemoryGB: resources.totalMemoryGB,
            memoryUtilization
        };
    }
    /**
     * Calculate safe batch size for memory
     *
     * @param totalMemoryGB - Total memory in GB
     * @param targetBatches - Desired number of batches (default 32)
     * @returns Batch size in records
     */
    calculateBatchSize(totalMemoryGB, targetBatches = 32) {
        const minBatch = 10000;
        const maxBatch = 10000000;
        if (totalMemoryGB < 4) {
            return 100000; // Low memory: small batches
        }
        const memoryPerBatch = totalMemoryGB / targetBatches;
        const estimatedRecordsPerMB = 500; // Rough estimate
        let batchSize = Math.floor(memoryPerBatch * 1024 * estimatedRecordsPerMB);
        batchSize = Math.max(minBatch, Math.min(maxBatch, batchSize));
        return batchSize;
    }
    /**
     * Calculate max execution time based on memory
     *
     * @param memoryGB - Available memory in GB
     * @returns Max execution time in seconds
     */
    calculateMaxExecutionTime(memoryGB) {
        if (memoryGB < 4) {
            return 30;
        }
        if (memoryGB < 8) {
            return 60;
        }
        if (memoryGB < 16) {
            return 120;
        }
        return 180;
    }
    /**
     * Calculate max threads based on memory
     *
     * @param memoryGB - Available memory in GB
     * @returns Max threads
     */
    calculateMaxThreads(memoryGB) {
        if (memoryGB < 4) {
            return 1;
        }
        if (memoryGB < 8) {
            return 2;
        }
        if (memoryGB < 16) {
            return 4;
        }
        return Math.min(8, Math.floor(memoryGB / 4));
    }
    /**
     * Calculate memory utilization ratio
     *
     * @param memoryGB - Available memory in GB
     * @returns Utilization ratio (0.0 - 1.0)
     */
    calculateMemoryUtilization(memoryGB) {
        if (memoryGB < 4) {
            return 0.5; // Conservative for low memory
        }
        if (memoryGB < 8) {
            return 0.6;
        }
        return 0.8; // Aggressive for high memory
    }
    /**
     * Validate minimum memory requirements
     *
     * @param resources - Detected system resources
     * @returns true if requirements met
     * @throws Error if insufficient memory
     */
    validateMinimumRequirements(resources) {
        const totalGB = resources.totalMemoryGB;
        if (totalGB < this.MIN_MEMORY_GB) {
            throw new Error(`Insufficient memory: ${totalGB.toFixed(1)}GB available, ` +
                `${this.MIN_MEMORY_GB}GB required. ` +
                `Consider using a server with more memory or cloud ClickHouse.`);
        }
        return true;
    }
    /**
     * Get recommended action for low memory
     *
     * @param resources - Detected system resources
     * @returns Action recommendation
     */
    getRecommendation(resources) {
        const totalGB = resources.totalMemoryGB;
        if (totalGB < 2) {
            return 'Upgrade to at least 2GB RAM or use managed ClickHouse service';
        }
        if (totalGB < 4) {
            return 'Low memory mode active. Consider upgrading to 4GB+ for better performance';
        }
        if (totalGB < 8) {
            return 'Standard mode. For optimal performance, 8GB+ RAM is recommended';
        }
        return 'Sufficient memory for production workload';
    }
}
