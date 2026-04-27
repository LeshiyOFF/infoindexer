import { describe, it, expect } from 'vitest';
import { BatchConfig } from './batch-config.vo';

/**
 * Спецификация для BatchConfig Value Object
 *
 * @remarks
 * Проверяет создание конфигурации, вычисления и валидацию.
 * Следует AAA pattern: Arrange, Act, Assert.
 */
describe('BatchConfig', () => {
  describe('constructor', () => {
    it('should create config with default values', () => {
      const config = new BatchConfig();

      expect(config.batchSize).toBe(5_000_000);
      expect(config.maxMemoryUsage).toBe(6_000_000_000);
      expect(config.maxExecutionTime).toBe(120);
    });

    it('should create config with custom values', () => {
      const config = new BatchConfig(2_000_000, 4_000_000_000, 60);

      expect(config.batchSize).toBe(2_000_000);
      expect(config.maxMemoryUsage).toBe(4_000_000_000);
      expect(config.maxExecutionTime).toBe(60);
    });

    it('should throw on batch size below minimum', () => {
      expect(() => new BatchConfig(100_000))
        .toThrow('Batch size must be between 1000000 and 10000000');
    });

    it('should throw on batch size above maximum', () => {
      expect(() => new BatchConfig(100_000_000))
        .toThrow('Batch size must be between 1000000 and 10000000');
    });

    it('should throw on boundary values', () => {
      expect(() => new BatchConfig(999_999)).toThrow();
      expect(() => new BatchConfig(10_000_001)).toThrow();
    });
  });

  describe('getBatchCount', () => {
    it('should calculate batches for exact division', () => {
      const config = new BatchConfig(5_000_000);
      expect(config.getBatchCount(10_000_000)).toBe(2);
      expect(config.getBatchCount(5_000_000)).toBe(1);
    });

    it('should round up for remainder', () => {
      const config = new BatchConfig(5_000_000);
      expect(config.getBatchCount(11_000_000)).toBe(3);
      expect(config.getBatchCount(1)).toBe(1);
    });

    it('should handle large numbers', () => {
      const config = new BatchConfig();
      expect(config.getBatchCount(161_000_000)).toBe(33);
    });

    it('should return 1 for zero records', () => {
      const config = new BatchConfig();
      expect(config.getBatchCount(0)).toBe(0);
    });
  });

  describe('getOffset', () => {
    it('should calculate offset for batch index', () => {
      const config = new BatchConfig(5_000_000);

      expect(config.getOffset(0)).toBe(0);
      expect(config.getOffset(1)).toBe(5_000_000);
      expect(config.getOffset(2)).toBe(10_000_000);
      expect(config.getOffset(10)).toBe(50_000_000);
    });

    it('should work with different batch sizes', () => {
      const config = new BatchConfig(2_000_000);

      expect(config.getOffset(0)).toBe(0);
      expect(config.getOffset(1)).toBe(2_000_000);
      expect(config.getOffset(5)).toBe(10_000_000);
    });
  });

  describe('optimalFor', () => {
    it('should create optimal config for small dataset', () => {
      const config = BatchConfig.optimalFor(1_000_000);

      expect(config.batchSize).toBeGreaterThanOrEqual(1_000_000);
      expect(config.batchSize).toBeLessThanOrEqual(10_000_000);
    });

    it('should create optimal config for medium dataset', () => {
      const config = BatchConfig.optimalFor(50_000_000);

      expect(config.batchSize).toBeGreaterThan(0);
      expect(config.batchSize).toBeLessThanOrEqual(10_000_000);
      expect(config.getBatchCount(50_000_000)).toBeGreaterThanOrEqual(5);
    });

    it('should create optimal config for large dataset', () => {
      const config = BatchConfig.optimalFor(161_000_000);

      expect(config.batchSize).toBeGreaterThan(0);
      expect(config.batchSize).toBeLessThanOrEqual(10_000_000);
    });

    it('should clamp to maximum batch size', () => {
      const config = BatchConfig.optimalFor(1_000_000_000);

      expect(config.batchSize).toBe(10_000_000);
    });

    it('should clamp to minimum batch size', () => {
      const config = BatchConfig.optimalFor(100_000);

      expect(config.batchSize).toBe(1_000_000);
    });
  });
});
