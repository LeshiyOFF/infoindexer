import { describe, it, expect } from 'vitest';
import { ConfigProfile, ConfigProfileType } from './config-profile.vo';

describe('ConfigProfile', () => {
  describe('predefined profiles', () => {
    it('should have LOW profile', () => {
      const profile = ConfigProfile.LOW;

      expect(profile.type).toBe(ConfigProfileType.LOW);
      expect(profile.name).toBe('Low Memory');
      expect(profile.minMemoryGB).toBe(0);
      expect(profile.maxMemoryGB).toBe(4);
      expect(profile.memoryUtilization).toBe(0.5);
      expect(profile.maxExecutionTime).toBe(30);
      expect(profile.maxThreads).toBe(1);
      expect(profile.batchSize).toBe(100000);
      expect(profile.warning).toBeDefined();
    });

    it('should have STANDARD profile', () => {
      const profile = ConfigProfile.STANDARD;

      expect(profile.type).toBe(ConfigProfileType.STANDARD);
      expect(profile.name).toBe('Standard');
      expect(profile.minMemoryGB).toBe(4);
      expect(profile.maxMemoryGB).toBe(16);
      expect(profile.memoryUtilization).toBe(0.6);
      expect(profile.maxExecutionTime).toBe(120);
      expect(profile.maxThreads).toBe(2);
      expect(profile.batchSize).toBe(1000000);
      expect(profile.warning).toBeUndefined();
    });

    it('should have HIGH profile', () => {
      const profile = ConfigProfile.HIGH;

      expect(profile.type).toBe(ConfigProfileType.HIGH);
      expect(profile.name).toBe('High Memory');
      expect(profile.minMemoryGB).toBe(16);
      expect(profile.maxMemoryGB).toBe(Infinity);
      expect(profile.memoryUtilization).toBe(0.8);
      expect(profile.maxExecutionTime).toBe(180);
      expect(profile.maxThreads).toBe(4);
      expect(profile.batchSize).toBe(5000000);
      expect(profile.warning).toBeUndefined();
    });
  });

  describe('selectFor', () => {
    it('should select LOW for < 4GB', () => {
      expect(ConfigProfile.selectFor(2)).toBe(ConfigProfile.LOW);
      expect(ConfigProfile.selectFor(0.5)).toBe(ConfigProfile.LOW);
    });

    it('should select STANDARD for 4-16GB', () => {
      expect(ConfigProfile.selectFor(4)).toBe(ConfigProfile.STANDARD);
      expect(ConfigProfile.selectFor(8)).toBe(ConfigProfile.STANDARD);
      expect(ConfigProfile.selectFor(15.9)).toBe(ConfigProfile.STANDARD);
    });

    it('should select HIGH for > 16GB', () => {
      expect(ConfigProfile.selectFor(16)).toBe(ConfigProfile.HIGH);
      expect(ConfigProfile.selectFor(32)).toBe(ConfigProfile.HIGH);
    });
  });

  describe('matches', () => {
    it('should match LOW profile for 2GB', () => {
      expect(ConfigProfile.LOW.matches(2)).toBe(true);
      expect(ConfigProfile.LOW.matches(4)).toBe(false);
    });

    it('should match STANDARD profile for 8GB', () => {
      expect(ConfigProfile.STANDARD.matches(8)).toBe(true);
      expect(ConfigProfile.STANDARD.matches(4)).toBe(true);
      expect(ConfigProfile.STANDARD.matches(16)).toBe(false);
    });

    it('should match HIGH profile for 32GB', () => {
      expect(ConfigProfile.HIGH.matches(32)).toBe(true);
      expect(ConfigProfile.HIGH.matches(16)).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return profile data', () => {
      const profile = ConfigProfile.LOW;
      const data = profile.toJSON();

      expect(data.type).toBe(ConfigProfileType.LOW);
      expect(data.name).toBe('Low Memory');
      expect(data.minMemoryGB).toBe(0);
      expect(data.maxMemoryGB).toBe(4);
    });
  });

  describe('validation', () => {
    it('should throw on negative minMemoryGB', () => {
      expect(() => new ConfigProfile({
        type: ConfigProfileType.LOW,
        name: 'Invalid',
        description: 'Test',
        minMemoryGB: -1,
        maxMemoryGB: 4,
        memoryUtilization: 0.5,
        maxExecutionTime: 30,
        maxThreads: 1,
        batchSize: 100000
      })).toThrow();
    });

    it('should throw on maxMemoryGB < minMemoryGB', () => {
      expect(() => new ConfigProfile({
        type: ConfigProfileType.LOW,
        name: 'Invalid',
        description: 'Test',
        minMemoryGB: 8,
        maxMemoryGB: 4,
        memoryUtilization: 0.5,
        maxExecutionTime: 30,
        maxThreads: 1,
        batchSize: 100000
      })).toThrow();
    });

    it('should throw on invalid memoryUtilization', () => {
      expect(() => new ConfigProfile({
        type: ConfigProfileType.LOW,
        name: 'Invalid',
        description: 'Test',
        minMemoryGB: 0,
        maxMemoryGB: 4,
        memoryUtilization: 1.5,
        maxExecutionTime: 30,
        maxThreads: 1,
        batchSize: 100000
      })).toThrow();
    });

    it('should throw on negative maxExecutionTime', () => {
      expect(() => new ConfigProfile({
        type: ConfigProfileType.LOW,
        name: 'Invalid',
        description: 'Test',
        minMemoryGB: 0,
        maxMemoryGB: 4,
        memoryUtilization: 0.5,
        maxExecutionTime: -1,
        maxThreads: 1,
        batchSize: 100000
      })).toThrow();
    });

    it('should throw on zero maxThreads', () => {
      expect(() => new ConfigProfile({
        type: ConfigProfileType.LOW,
        name: 'Invalid',
        description: 'Test',
        minMemoryGB: 0,
        maxMemoryGB: 4,
        memoryUtilization: 0.5,
        maxExecutionTime: 30,
        maxThreads: 0,
        batchSize: 100000
      })).toThrow();
    });

    it('should throw on zero batchSize', () => {
      expect(() => new ConfigProfile({
        type: ConfigProfileType.LOW,
        name: 'Invalid',
        description: 'Test',
        minMemoryGB: 0,
        maxMemoryGB: 4,
        memoryUtilization: 0.5,
        maxExecutionTime: 30,
        maxThreads: 1,
        batchSize: 0
      })).toThrow();
    });
  });

  describe('all', () => {
    it('should return all profiles', () => {
      const profiles = ConfigProfile.all();

      expect(profiles).toHaveLength(3);
      expect(profiles).toContain(ConfigProfile.LOW);
      expect(profiles).toContain(ConfigProfile.STANDARD);
      expect(profiles).toContain(ConfigProfile.HIGH);
    });
  });
});
