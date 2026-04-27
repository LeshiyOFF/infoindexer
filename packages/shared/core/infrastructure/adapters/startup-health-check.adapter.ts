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
import { ConfigProfile } from '../../domain/value-objects/config-profile.vo';
import { ResourceCalculationService } from '../../domain/services/resource-calculation.service';
import { selectConfigProfile } from '../../domain/value-objects/config-profile.utils';

/**
 * Startup Health Check Adapter
 */
export class StartupHealthCheckAdapter implements IStartupHealthCheckPort {
  private readonly MIN_MEMORY_GB = 2;

  constructor(
    private readonly calculationService: ResourceCalculationService = new ResourceCalculationService()
  ) {}

  /**
   * Validate resources and return health status
   */
  validate(resources: ResourceInfo): HealthStatus {
    const totalGB = resources.totalMemoryGB;

    if (totalGB < this.MIN_MEMORY_GB) {
      return {
        status: 'unhealthy',
        reason: `Insufficient memory: ${totalGB.toFixed(1)}GB available, ${this.MIN_MEMORY_GB}GB required`,
        action: this.getInsufficientMemoryAction(totalGB)
      };
    }

    const profile = selectConfigProfile(totalGB);

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
  private getInsufficientMemoryAction(currentGB: number): string {
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
  isSufficient(resources: ResourceInfo): boolean {
    const status = this.validate(resources);
    return status.status !== 'unhealthy';
  }

  /**
   * Get health check report
   */
  getReport(resources: ResourceInfo): string {
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
