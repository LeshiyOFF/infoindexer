"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupHealthCheckAdapter = void 0;
const resource_calculation_service_1 = require("../../domain/services/resource-calculation.service");
const config_profile_utils_1 = require("../../domain/value-objects/config-profile.utils");
/**
 * Startup Health Check Adapter
 */
class StartupHealthCheckAdapter {
    calculationService;
    MIN_MEMORY_GB = 2;
    constructor(calculationService = new resource_calculation_service_1.ResourceCalculationService()) {
        this.calculationService = calculationService;
    }
    /**
     * Validate resources and return health status
     */
    validate(resources) {
        const totalGB = resources.totalMemoryGB;
        if (totalGB < this.MIN_MEMORY_GB) {
            return {
                status: 'unhealthy',
                reason: `Insufficient memory: ${totalGB.toFixed(1)}GB available, ${this.MIN_MEMORY_GB}GB required`,
                action: this.getInsufficientMemoryAction(totalGB)
            };
        }
        const profile = (0, config_profile_utils_1.selectConfigProfile)(totalGB);
        if (totalGB < 4) {
            return {
                status: 'degraded',
                profile,
                warning: `Low memory mode active. ${this.calculationService.getRecommendation(resources)}`
            };
        }
        if (totalGB < 8) {
            return {
                status: 'degraded',
                profile,
                warning: 'Standard mode. Consider upgrading to 8GB+ for better performance'
            };
        }
        return {
            status: 'healthy',
            profile
        };
    }
    /**
     * Get action recommendation for insufficient memory
     */
    getInsufficientMemoryAction(currentGB) {
        if (currentGB < 1) {
            return 'Upgrade to at least 2GB RAM or use managed ClickHouse service (e.g., ClickHouse Cloud)';
        }
        const actions = [
            'Consider these options:',
            '1. Upgrade server to at least 2GB RAM',
            '2. Use managed ClickHouse service (ClickHouse Cloud, Altinity)',
            '3. Deploy to a cloud provider with flexible memory sizing',
            '4. Use PostgreSQL instead of ClickHouse for lower memory requirements'
        ];
        return actions.join('\n');
    }
    /**
     * Check if resources are sufficient
     */
    isSufficient(resources) {
        const status = this.validate(resources);
        return status.status !== 'unhealthy';
    }
    /**
     * Get health check report
     */
    getReport(resources) {
        const status = this.validate(resources);
        const lines = [
            `=== Resource Health Check ===`,
            `Memory: ${resources.totalMemory.format()} (${resources.source})`,
            `Status: ${status.status.toUpperCase()}`
        ];
        if (status.status === 'healthy' || status.status === 'degraded') {
            lines.push(`Profile: ${status.profile.name}`);
            lines.push(`Max Memory: ${status.profile.maxMemoryGB}GB (${status.profile.memoryUtilization * 100}%)`);
            lines.push(`Max Threads: ${status.profile.maxThreads}`);
        }
        if (status.status === 'degraded' && status.warning) {
            lines.push(`Warning: ${status.warning}`);
        }
        if (status.status === 'unhealthy') {
            lines.push(`Reason: ${status.reason}`);
            lines.push(`Action:\n${status.action}`);
        }
        lines.push('============================');
        return lines.join('\n');
    }
}
exports.StartupHealthCheckAdapter = StartupHealthCheckAdapter;
