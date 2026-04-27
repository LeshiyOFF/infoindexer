import { describe, it, expect, vi } from 'vitest';
import { ResourceInfo, ResourceSource } from './resource-info.vo';
import { MemorySize } from './memory-size.vo';

describe('ResourceInfo', () => {
  describe('factories', () => {
    it('should create from bytes', () => {
      const info = ResourceInfo.fromBytes(8589934592);
      expect(info.totalMemoryGB).toBe(8);
    });

    it('should create from GB', () => {
      const info = ResourceInfo.fromGB(16);
      expect(info.totalMemoryGB).toBe(16);
    });

    it('should create from cgroup v1', () => {
      const info = ResourceInfo.fromCgroup(8589934592, 1);
      expect(info.source).toBe(ResourceSource.CGROUP_V1);
      expect(info.isContainerized).toBe(true);
    });

    it('should create from cgroup v2', () => {
      const info = ResourceInfo.fromCgroup(8589934592, 2);
      expect(info.source).toBe(ResourceSource.CGROUP_V2);
      expect(info.isContainerized).toBe(true);
    });

    it('should create from OS', () => {
      const info = ResourceInfo.fromOS(8589934592);
      expect(info.source).toBe(ResourceSource.OS);
      expect(info.isContainerized).toBe(false);
    });

    it('should create with available memory', () => {
      const info = ResourceInfo.withAvailable(8589934592, 4294967296, ResourceSource.OS);
      expect(info.totalMemoryGB).toBe(8);
      expect(info.availableMemory.toGB()).toBe(4);
    });
  });

  describe('properties', () => {
    it('should expose total memory', () => {
      const info = ResourceInfo.fromGB(16);
      expect(info.totalMemory.toGB()).toBe(16);
    });

    it('should expose available memory (defaults to total)', () => {
      const info = ResourceInfo.fromGB(16);
      expect(info.availableMemory.toGB()).toBe(16);
    });

    it('should expose source', () => {
      const info = ResourceInfo.fromOS(8589934592);
      expect(info.source).toBe(ResourceSource.OS);
    });

    it('should expose isContainerized', () => {
      const containerInfo = ResourceInfo.fromCgroup(8589934592, 1);
      expect(containerInfo.isContainerized).toBe(true);

      const osInfo = ResourceInfo.fromOS(8589934592);
      expect(osInfo.isContainerized).toBe(false);
    });
  });

  describe('isBelowThreshold', () => {
    it('should return true when below threshold', () => {
      const info = ResourceInfo.fromGB(2);
      expect(info.isBelowThreshold(4)).toBe(true);
    });

    it('should return false when above threshold', () => {
      const info = ResourceInfo.fromGB(8);
      expect(info.isBelowThreshold(4)).toBe(false);
    });
  });

  describe('utilization', () => {
    it('should be 0 when no available memory set', () => {
      const info = ResourceInfo.fromGB(16);
      expect(info.utilization()).toBe(0);
    });

    it('should calculate utilization', () => {
      const info = ResourceInfo.withAvailable(8589934592, 4294967296, ResourceSource.OS);
      expect(info.utilization()).toBe(0.5);
    });
  });

  describe('describe', () => {
    it('should return description string for container', () => {
      const info = ResourceInfo.fromCgroup(8589934592, 2);
      const desc = info.describe();

      expect(desc).toContain('CGROUP-V2');
      expect(desc).toContain('8.0GB');
      expect(desc).toContain('containerized');
    });

    it('should return description string for OS', () => {
      const info = ResourceInfo.fromOS(17179869184);
      const desc = info.describe();

      expect(desc).toContain('OS');
      expect(desc).toContain('16.0GB');
      expect(desc).toContain('bare metal');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const info = ResourceInfo.fromGB(16);
      const json = info.toJSON();

      expect(json.totalMemoryGB).toBe(16);
      expect(json.source).toBe(ResourceSource.UNKNOWN);
      expect(json.isContainerized).toBe(false);
      expect(json.utilization).toBe(0);
    });
  });

  describe('validation', () => {
    it('should throw on zero memory', () => {
      expect(() => ResourceInfo.fromBytes(0)).toThrow();
    });

    it('should throw on negative memory', () => {
      expect(() => ResourceInfo.fromBytes(-1)).toThrow();
    });

    it('should throw when available > total', () => {
      expect(() => ResourceInfo.withAvailable(8589934592, 17179869184, ResourceSource.OS)).toThrow();
    });
  });
});
