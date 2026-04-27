import { describe, it, expect } from 'vitest';
import { StartupHealthCheckAdapter } from './startup-health-check.adapter';
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';
import { ConfigProfile, ConfigProfileType } from '../../domain/value-objects/config-profile.vo';

describe('StartupHealthCheckAdapter', () => {
  let adapter: StartupHealthCheckAdapter;

  beforeEach(() => {
    adapter = new StartupHealthCheckAdapter();
  });

  describe('validate', () => {
    it('should return unhealthy for < 2GB', () => {
      const resources = ResourceInfo.fromGB(1);
      const status = adapter.validate(resources);

      expect(status.status).toBe('unhealthy');
      if (status.status === 'unhealthy') {
        expect(status.reason).toContain('Insufficient memory');
        expect(status.action).toContain('Upgrade');
      }
    });

    it('should return degraded for 2-4GB', () => {
      const resources = ResourceInfo.fromGB(3);
      const status = adapter.validate(resources);

      expect(status.status).toBe('degraded');
      if (status.status === 'degraded') {
        expect(status.profile).toBe(ConfigProfile.LOW);
        expect(status.warning).toContain('Low memory mode');
      }
    });

    it('should return degraded for 4-8GB', () => {
      const resources = ResourceInfo.fromGB(6);
      const status = adapter.validate(resources);

      expect(status.status).toBe('degraded');
      if (status.status === 'degraded') {
        expect(status.profile).toBe(ConfigProfile.STANDARD);
        expect(status.warning).toContain('Standard mode');
      }
    });

    it('should return healthy for > 8GB', () => {
      const resources = ResourceInfo.fromGB(16);
      const status = adapter.validate(resources);

      expect(status.status).toBe('healthy');
      if (status.status === 'healthy') {
        expect(status.profile).toBe(ConfigProfile.HIGH);
      }
    });
  });

  describe('isSufficient', () => {
    it('should return false for < 2GB', () => {
      const resources = ResourceInfo.fromGB(1);
      expect(adapter.isSufficient(resources)).toBe(false);
    });

    it('should return true for >= 2GB', () => {
      const resources = ResourceInfo.fromGB(4);
      expect(adapter.isSufficient(resources)).toBe(true);
    });
  });

  describe('getReport', () => {
    it('should generate report for unhealthy', () => {
      const resources = ResourceInfo.fromGB(1);
      const report = adapter.getReport(resources);

      expect(report).toContain('UNHEALTHY');
      expect(report).toContain('1.0GB');
      expect(report).toContain('Insufficient memory');
      expect(report).toContain('Action:');
    });

    it('should generate report for degraded', () => {
      const resources = ResourceInfo.fromGB(3);
      const report = adapter.getReport(resources);

      expect(report).toContain('DEGRADED');
      expect(report).toContain('3.0GB');
      expect(report).toContain('Low Memory');
      expect(report).toContain('Warning:');
    });

    it('should generate report for healthy', () => {
      const resources = ResourceInfo.fromGB(16);
      const report = adapter.getReport(resources);

      expect(report).toContain('HEALTHY');
      expect(report).toContain('16.0GB');
      expect(report).toContain('High Memory');
    });
  });
});
