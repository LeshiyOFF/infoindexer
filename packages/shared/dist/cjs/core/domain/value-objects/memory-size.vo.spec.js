"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const memory_size_vo_1 = require("./memory-size.vo");
(0, vitest_1.describe)('MemorySize', () => {
    (0, vitest_1.describe)('factories', () => {
        (0, vitest_1.it)('should create from bytes', () => {
            const size = memory_size_vo_1.MemorySize.fromBytes(1024);
            (0, vitest_1.expect)(size.toBytes()).toBe(1024);
        });
        (0, vitest_1.it)('should create from MB', () => {
            const size = memory_size_vo_1.MemorySize.fromMB(1);
            (0, vitest_1.expect)(size.toBytes()).toBe(1024 * 1024);
        });
        (0, vitest_1.it)('should create from GB', () => {
            const size = memory_size_vo_1.MemorySize.fromGB(1);
            (0, vitest_1.expect)(size.toBytes()).toBe(1024 * 1024 * 1024);
        });
        (0, vitest_1.it)('should throw on negative bytes', () => {
            (0, vitest_1.expect)(() => memory_size_vo_1.MemorySize.fromBytes(-1)).toThrow();
        });
    });
    (0, vitest_1.describe)('conversions', () => {
        (0, vitest_1.it)('should convert to bytes', () => {
            const size = memory_size_vo_1.MemorySize.fromGB(1);
            (0, vitest_1.expect)(size.toBytes()).toBe(1073741824);
        });
        (0, vitest_1.it)('should convert to MB', () => {
            const size = memory_size_vo_1.MemorySize.fromGB(1);
            (0, vitest_1.expect)(size.toMB()).toBe(1024);
        });
        (0, vitest_1.it)('should convert to GB', () => {
            const size = memory_size_vo_1.MemorySize.fromMB(1024);
            (0, vitest_1.expect)(size.toGB()).toBe(1);
        });
        (0, vitest_1.it)('should convert to GB with decimal', () => {
            const size = memory_size_vo_1.MemorySize.fromMB(512);
            (0, vitest_1.expect)(size.toGB()).toBe(0.5);
        });
    });
    (0, vitest_1.describe)('operations', () => {
        (0, vitest_1.it)('should calculate percentage of another', () => {
            const size1 = memory_size_vo_1.MemorySize.fromGB(1);
            const size2 = memory_size_vo_1.MemorySize.fromGB(2);
            (0, vitest_1.expect)(size1.percentageOf(size2)).toBe(50);
        });
        (0, vitest_1.it)('should multiply', () => {
            const size = memory_size_vo_1.MemorySize.fromGB(1);
            const doubled = size.multiply(2);
            (0, vitest_1.expect)(doubled.toGB()).toBe(2);
        });
        (0, vitest_1.it)('should add', () => {
            const size1 = memory_size_vo_1.MemorySize.fromGB(1);
            const size2 = memory_size_vo_1.MemorySize.fromGB(2);
            const sum = size1.add(size2);
            (0, vitest_1.expect)(sum.toGB()).toBe(3);
        });
        (0, vitest_1.it)('should subtract', () => {
            const size1 = memory_size_vo_1.MemorySize.fromGB(3);
            const size2 = memory_size_vo_1.MemorySize.fromGB(1);
            const diff = size1.subtract(size2);
            (0, vitest_1.expect)(diff.toGB()).toBe(2);
        });
    });
    (0, vitest_1.describe)('comparisons', () => {
        (0, vitest_1.it)('should check if zero', () => {
            const size = memory_size_vo_1.MemorySize.fromBytes(0);
            (0, vitest_1.expect)(size.isZero()).toBe(true);
        });
        (0, vitest_1.it)('should check if less than', () => {
            const size1 = memory_size_vo_1.MemorySize.fromGB(1);
            const size2 = memory_size_vo_1.MemorySize.fromGB(2);
            (0, vitest_1.expect)(size1.lessThan(size2)).toBe(true);
            (0, vitest_1.expect)(size2.lessThan(size1)).toBe(false);
        });
        (0, vitest_1.it)('should check if greater than or equal', () => {
            const size1 = memory_size_vo_1.MemorySize.fromGB(2);
            const size2 = memory_size_vo_1.MemorySize.fromGB(1);
            (0, vitest_1.expect)(size1.greaterThanOrEqualTo(size2)).toBe(true);
            (0, vitest_1.expect)(size1.greaterThanOrEqualTo(size1)).toBe(true);
        });
    });
    (0, vitest_1.describe)('formatting', () => {
        (0, vitest_1.it)('should format GB', () => {
            const size = memory_size_vo_1.MemorySize.fromGB(8);
            (0, vitest_1.expect)(size.format()).toBe('8.0GB');
        });
        (0, vitest_1.it)('should format MB', () => {
            const size = memory_size_vo_1.MemorySize.fromMB(512);
            (0, vitest_1.expect)(size.format()).toBe('512MB');
        });
        (0, vitest_1.it)('should format bytes', () => {
            const size = memory_size_vo_1.MemorySize.fromBytes(512);
            (0, vitest_1.expect)(size.format()).toBe('512B');
        });
    });
});
