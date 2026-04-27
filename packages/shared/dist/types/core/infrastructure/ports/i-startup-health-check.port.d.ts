/**
 * Port for Startup Health Check
 *
 * @remarks
 * Abstracts the validation of system resources at application startup.
 * Fail-fast if resources are insufficient for operation.
 *
 * Follows Dependency Inversion: startup logic depends on this port,
 * not on concrete validation implementation.
 */
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';
import { ConfigProfile } from '../../domain/value-objects/config-profile.vo';
/**
 * Health status type
 */
export type HealthStatus = {
    status: 'healthy';
    profile: ConfigProfile;
} | {
    status: 'degraded';
    profile: ConfigProfile;
    warning: string;
} | {
    status: 'unhealthy';
    reason: string;
    action: string;
};
/**
 * Startup Health Check Port
 */
export interface IStartupHealthCheckPort {
    /**
     * Validate resources and return health status
     *
     * @param resources - Detected system resources
     * @returns Health status with profile or error details
     *
     * @example
     * ```ts
     * const status = healthCheck.validate(resources);
     * if (status.status === 'unhealthy') {
     *   console.error(status.reason);
     *   console.log(status.action);
     * }
     * ```
     */
    validate(resources: ResourceInfo): HealthStatus;
}
