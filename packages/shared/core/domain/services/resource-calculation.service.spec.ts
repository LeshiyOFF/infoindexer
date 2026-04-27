import { describe, it, expect } from 'vitest';
import { ResourceCalculationService } from './resource-calculation.service';
import { ResourceInfo } from '../value-objects/resource-info.vo';
import { ConfigProfile } from '../value-objects/config-profile.vo';

describe('ResourceCalculationService', () => {
  let service: ResourceCalculationService;

  beforeEach(() => {
    service = new ResourceCalculationService();
  });

  describe('calculate', () => {
    it('should calculate for LOW profile', () => {
      const resources = ResourceInfo.fromGB(2);
      const profile = ConfigProfile.LOW;

      const config = service.calculate(resources, profile);

      expect(config.maxMemoryUsage).toBe('1073741824'); // 1GB
      expect(config.maxExecutionTime).toBe(30);
      expect(config.maxThreads).toBe(1);
      expect(config.batchSize).toBe(100000);
    });

    it('should calculate for STANDARD profile', () => {
      const resources = ResourceInfo.fromGB(8);
      const profile = ConfigProfile.STANDARD;

      const config = service.calculate(resources, profile);

      expect(config.maxMemoryUsage).toBe('5153960755'); // ~4.8GB
      expect(config.maxExecutionTime).toBe(120);
      expect(config.maxThreads).toBe(2);
      expect(config.batchSize).toBe(1000000);
    });

    it('should calculate for HIGH profile', () => {
      const resources = ResourceInfo.fromGB(32);
      const profile = ConfigProfile.HIGH;

      const config = service.calculate(resources, profile);

      expect(config.maxMemoryUsage).toBe('27487790694'); // ~25.6GB
      expect(config.maxExecutionTime).toBe(180);
      expect(config.maxThreads).toBe(4);
      expect(config.batchSize).toBe(5000000);
    });
  });

  describe('calculateBatchSize', () => {
    it('should return small batch for low memory', () => {
      const size = service.calculateBatchSize(2);
      expect(size).toBe(100000);
    });

    it('should return medium batch for standard memory', () => {
      const size = service.calculateBatchSize(8);
      expect(size).toBeGreaterThan(100000);
      expect(size).toBeLessThanOrEqual(10000000);
    });

    it('should return large batch for high memory', () => {
      const size = service.calculateBatchSize(32);
      expect(size).toBeGreaterThan(1000000);
      expect(size).toBeLessThanOrEqual(10000000);
    });
  });

  describe('calculateMaxExecutionTime', () => {
    it('should return 30s for < 4GB', () => {
      expect(service.calculateMaxExecutionTime(2)).toBe(30);
    });

    it('should return 60s for 4-8GB', () => {
      expect(service.calculateMaxExecutionTime(4)).toBe(60);
      expect(service.calculateMaxExecutionTime(6)).toBe(60);
    });

    it('should return 120s for 8-16GB', () => {
      expect(service.calculateMaxExecutionTime(8)).toBe(120);
      expect(service.calculateMaxExecutionTime(12)).toBe(120);
    });

    it('should return 180s for > 16GB', () => {
      expect(service.calculateMaxExecutionTime(16)).toBe(180);
      expect(service.calculateMaxExecutionTime(32)).toBe(180);
    });
  });

  describe('calculateMaxThreads', () => {
    it('should return 1 for < 4GB', () => {
      expect(service.calculateMaxThreads(2)).toBe(1);
    });

    it('should return 2 for 4-8GB', () => {
      expect(service.calculateMaxThreads(4)).toBe(2);
    });

    it('should return 4 for 8-16GB', () => {
      expect(service.calculateMaxThreads(8)).toBe(4);
    });

    it('should return 8 for > 16GB', () => {
      expect(service.calculateMaxThreads(32)).toBe(8);
    });
  });

  describe('calculateMemoryUtilization', () => {
    it('should return 0.5 for < 4GB', () => {
      expect(service.calculateMemoryUtilization(2)).toBe(0.5);
    });

    it('should return 0.6 for 4-8GB', () => {
      expect(service.calculateMemoryUtilization(4)).toBe(0.6);
    });

    it('should return 0.8 for > 8GB', () => {
      expect(service.calculateMemoryUtilization(16)).toBe(0.8);
    });
  });

  describe('validateMinimumRequirements', () => {
    it('should pass for sufficient memory', () => {
      const resources = ResourceInfo.fromGB(4);
      expect(service.validateMinimumRequirements(resources)).toBe(true);
    });

    it('should throw for insufficient memory', () => {
      const resources = ResourceInfo.fromGB(1);

      expect(() => service.validateMinimumRequirements(resources)).toThrow();
    });
  });

  describe('getRecommendation', () => {
    it('should recommend upgrade for < 2GB', () => {
      const resources = ResourceInfo.fromGB(1);
      const rec = service.getRecommendation(resources);

      expect(rec).toContain('Upgrade to at least 2GB');
    });

    it('should warn for 2-4GB', () => {
      const resources = ResourceInfo.fromGB(3);
      const rec = service.getRecommendation(resources);

      expect(rec).toContain('Low memory mode');
    });

    it('should suggest improvement for 4-8GB', () => {
      const resources = ResourceInfo.fromGB(6);
      const rec = service.getRecommendation(resources);

      expect(rec).toContain('8GB+');
    });

    it('should indicate sufficient for > 8GB', () => {
      const resources = ResourceInfo.fromGB(16);
      const rec = service.getRecommendation(resources);

      expect(rec).toContain('Sufficient memory');
    });
  });
});
