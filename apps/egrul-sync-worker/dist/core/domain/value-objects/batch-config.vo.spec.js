"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const batch_config_vo_1 = require("./batch-config.vo");
/**
 * Спецификация для BatchConfig Value Object
 *
 * @remarks
 * Проверяет создание конфигурации, вычисления и валидацию.
 * Следует AAA pattern: Arrange, Act, Assert.
 */
(0, vitest_1.describe)('BatchConfig', () => {
    (0, vitest_1.describe)('constructor', () => {
        (0, vitest_1.it)('should create config with default values', () => {
            const config = new batch_config_vo_1.BatchConfig();
            (0, vitest_1.expect)(config.batchSize).toBe(5_000_000);
            (0, vitest_1.expect)(config.maxMemoryUsage).toBe(6_000_000_000);
            (0, vitest_1.expect)(config.maxExecutionTime).toBe(120);
        });
        (0, vitest_1.it)('should create config with custom values', () => {
            const config = new batch_config_vo_1.BatchConfig(2_000_000, 4_000_000_000, 60);
            (0, vitest_1.expect)(config.batchSize).toBe(2_000_000);
            (0, vitest_1.expect)(config.maxMemoryUsage).toBe(4_000_000_000);
            (0, vitest_1.expect)(config.maxExecutionTime).toBe(60);
        });
        (0, vitest_1.it)('should throw on batch size below minimum', () => {
            (0, vitest_1.expect)(() => new batch_config_vo_1.BatchConfig(100_000))
                .toThrow('Batch size must be between 1000000 and 10000000');
        });
        (0, vitest_1.it)('should throw on batch size above maximum', () => {
            (0, vitest_1.expect)(() => new batch_config_vo_1.BatchConfig(100_000_000))
                .toThrow('Batch size must be between 1000000 and 10000000');
        });
        (0, vitest_1.it)('should throw on boundary values', () => {
            (0, vitest_1.expect)(() => new batch_config_vo_1.BatchConfig(999_999)).toThrow();
            (0, vitest_1.expect)(() => new batch_config_vo_1.BatchConfig(10_000_001)).toThrow();
        });
    });
    (0, vitest_1.describe)('getBatchCount', () => {
        (0, vitest_1.it)('should calculate batches for exact division', () => {
            const config = new batch_config_vo_1.BatchConfig(5_000_000);
            (0, vitest_1.expect)(config.getBatchCount(10_000_000)).toBe(2);
            (0, vitest_1.expect)(config.getBatchCount(5_000_000)).toBe(1);
        });
        (0, vitest_1.it)('should round up for remainder', () => {
            const config = new batch_config_vo_1.BatchConfig(5_000_000);
            (0, vitest_1.expect)(config.getBatchCount(11_000_000)).toBe(3);
            (0, vitest_1.expect)(config.getBatchCount(1)).toBe(1);
        });
        (0, vitest_1.it)('should handle large numbers', () => {
            const config = new batch_config_vo_1.BatchConfig();
            (0, vitest_1.expect)(config.getBatchCount(161_000_000)).toBe(33);
        });
        (0, vitest_1.it)('should return 1 for zero records', () => {
            const config = new batch_config_vo_1.BatchConfig();
            (0, vitest_1.expect)(config.getBatchCount(0)).toBe(0);
        });
    });
    (0, vitest_1.describe)('getOffset', () => {
        (0, vitest_1.it)('should calculate offset for batch index', () => {
            const config = new batch_config_vo_1.BatchConfig(5_000_000);
            (0, vitest_1.expect)(config.getOffset(0)).toBe(0);
            (0, vitest_1.expect)(config.getOffset(1)).toBe(5_000_000);
            (0, vitest_1.expect)(config.getOffset(2)).toBe(10_000_000);
            (0, vitest_1.expect)(config.getOffset(10)).toBe(50_000_000);
        });
        (0, vitest_1.it)('should work with different batch sizes', () => {
            const config = new batch_config_vo_1.BatchConfig(2_000_000);
            (0, vitest_1.expect)(config.getOffset(0)).toBe(0);
            (0, vitest_1.expect)(config.getOffset(1)).toBe(2_000_000);
            (0, vitest_1.expect)(config.getOffset(5)).toBe(10_000_000);
        });
    });
    (0, vitest_1.describe)('optimalFor', () => {
        (0, vitest_1.it)('should create optimal config for small dataset', () => {
            const config = batch_config_vo_1.BatchConfig.optimalFor(1_000_000);
            (0, vitest_1.expect)(config.batchSize).toBeGreaterThanOrEqual(1_000_000);
            (0, vitest_1.expect)(config.batchSize).toBeLessThanOrEqual(10_000_000);
        });
        (0, vitest_1.it)('should create optimal config for medium dataset', () => {
            const config = batch_config_vo_1.BatchConfig.optimalFor(50_000_000);
            (0, vitest_1.expect)(config.batchSize).toBeGreaterThan(0);
            (0, vitest_1.expect)(config.batchSize).toBeLessThanOrEqual(10_000_000);
            (0, vitest_1.expect)(config.getBatchCount(50_000_000)).toBeGreaterThanOrEqual(5);
        });
        (0, vitest_1.it)('should create optimal config for large dataset', () => {
            const config = batch_config_vo_1.BatchConfig.optimalFor(161_000_000);
            (0, vitest_1.expect)(config.batchSize).toBeGreaterThan(0);
            (0, vitest_1.expect)(config.batchSize).toBeLessThanOrEqual(10_000_000);
        });
        (0, vitest_1.it)('should clamp to maximum batch size', () => {
            const config = batch_config_vo_1.BatchConfig.optimalFor(1_000_000_000);
            (0, vitest_1.expect)(config.batchSize).toBe(10_000_000);
        });
        (0, vitest_1.it)('should clamp to minimum batch size', () => {
            const config = batch_config_vo_1.BatchConfig.optimalFor(100_000);
            (0, vitest_1.expect)(config.batchSize).toBe(1_000_000);
        });
    });
});
