/**
 * Startup Health Check Adapter
 *
 * @remarks
 * Validates system resources at application startup.
 * Provides fail-fast error if resources are insufficient.
 *
 * Implements IStartupHealthCheckPort following Dependency Inversion.
 */
import { IStartupHealthCheckPort, HealthStatus } from '../ports/i-startup-health-check.port';
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';
import { ResourceCalculationService } from '../../domain/services/resource-calculation.service';
/**
 * Startup Health Check Adapter
 */
export declare class StartupHealthCheckAdapter implements IStartupHealthCheckPort {
    private readonly calculationService;
    private readonly MIN_MEMORY_GB;
    constructor(calculationService?: ResourceCalculationService);
    /**
     * Validate resources and return health status
     */
    validate(resources: ResourceInfo): HealthStatus;
    /**
     * Get action recommendation for insufficient memory
     */
    private getInsufficientMemoryAction;
    /**
     * Check if resources are sufficient
     */
    isSufficient(resources: ResourceInfo): boolean;
    /**
     * Get health check report
     */
    getReport(resources: ResourceInfo): string;
}
