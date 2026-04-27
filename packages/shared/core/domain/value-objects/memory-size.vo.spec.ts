import { describe, it, expect } from 'vitest';
import { MemorySize } from './memory-size.vo';

describe('MemorySize', () => {
  describe('factories', () => {
    it('should create from bytes', () => {
      const size = MemorySize.fromBytes(1024);
      expect(size.toBytes()).toBe(1024);
    });

    it('should create from MB', () => {
      const size = MemorySize.fromMB(1);
      expect(size.toBytes()).toBe(1024 * 1024);
    });

    it('should create from GB', () => {
      const size = MemorySize.fromGB(1);
      expect(size.toBytes()).toBe(1024 * 1024 * 1024);
    });

    it('should throw on negative bytes', () => {
      expect(() => MemorySize.fromBytes(-1)).toThrow();
    });
  });

  describe('conversions', () => {
    it('should convert to bytes', () => {
      const size = MemorySize.fromGB(1);
      expect(size.toBytes()).toBe(1073741824);
    });

    it('should convert to MB', () => {
      const size = MemorySize.fromGB(1);
      expect(size.toMB()).toBe(1024);
    });

    it('should convert to GB', () => {
      const size = MemorySize.fromMB(1024);
      expect(size.toGB()).toBe(1);
    });

    it('should convert to GB with decimal', () => {
      const size = MemorySize.fromMB(512);
      expect(size.toGB()).toBe(0.5);
    });
  });

  describe('operations', () => {
    it('should calculate percentage of another', () => {
      const size1 = MemorySize.fromGB(1);
      const size2 = MemorySize.fromGB(2);
      expect(size1.percentageOf(size2)).toBe(50);
    });

    it('should multiply', () => {
      const size = MemorySize.fromGB(1);
      const doubled = size.multiply(2);
      expect(doubled.toGB()).toBe(2);
    });

    it('should add', () => {
      const size1 = MemorySize.fromGB(1);
      const size2 = MemorySize.fromGB(2);
      const sum = size1.add(size2);
      expect(sum.toGB()).toBe(3);
    });

    it('should subtract', () => {
      const size1 = MemorySize.fromGB(3);
      const size2 = MemorySize.fromGB(1);
      const diff = size1.subtract(size2);
      expect(diff.toGB()).toBe(2);
    });
  });

  describe('comparisons', () => {
    it('should check if zero', () => {
      const size = MemorySize.fromBytes(0);
      expect(size.isZero()).toBe(true);
    });

    it('should check if less than', () => {
      const size1 = MemorySize.fromGB(1);
      const size2 = MemorySize.fromGB(2);
      expect(size1.lessThan(size2)).toBe(true);
      expect(size2.lessThan(size1)).toBe(false);
    });

    it('should check if greater than or equal', () => {
      const size1 = MemorySize.fromGB(2);
      const size2 = MemorySize.fromGB(1);
      expect(size1.greaterThanOrEqualTo(size2)).toBe(true);
      expect(size1.greaterThanOrEqualTo(size1)).toBe(true);
    });
  });

  describe('formatting', () => {
    it('should format GB', () => {
      const size = MemorySize.fromGB(8);
      expect(size.format()).toBe('8.0GB');
    });

    it('should format MB', () => {
      const size = MemorySize.fromMB(512);
      expect(size.format()).toBe('512MB');
    });

    it('should format bytes', () => {
      const size = MemorySize.fromBytes(512);
      expect(size.format()).toBe('512B');
    });
  });
});
