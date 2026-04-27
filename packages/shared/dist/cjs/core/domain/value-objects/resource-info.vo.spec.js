"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const resource_info_vo_1 = require("./resource-info.vo");
(0, vitest_1.describe)('ResourceInfo', () => {
    (0, vitest_1.describe)('factories', () => {
        (0, vitest_1.it)('should create from bytes', () => {
            const info = resource_info_vo_1.ResourceInfo.fromBytes(8589934592);
            (0, vitest_1.expect)(info.totalMemoryGB).toBe(8);
        });
        (0, vitest_1.it)('should create from GB', () => {
            const info = resource_info_vo_1.ResourceInfo.fromGB(16);
            (0, vitest_1.expect)(info.totalMemoryGB).toBe(16);
        });
        (0, vitest_1.it)('should create from cgroup v1', () => {
            const info = resource_info_vo_1.ResourceInfo.fromCgroup(8589934592, 1);
            (0, vitest_1.expect)(info.source).toBe(resource_info_vo_1.ResourceSource.CGROUP_V1);
            (0, vitest_1.expect)(info.isContainerized).toBe(true);
        });
        (0, vitest_1.it)('should create from cgroup v2', () => {
            const info = resource_info_vo_1.ResourceInfo.fromCgroup(8589934592, 2);
            (0, vitest_1.expect)(info.source).toBe(resource_info_vo_1.ResourceSource.CGROUP_V2);
            (0, vitest_1.expect)(info.isContainerized).toBe(true);
        });
        (0, vitest_1.it)('should create from OS', () => {
            const info = resource_info_vo_1.ResourceInfo.fromOS(8589934592);
            (0, vitest_1.expect)(info.source).toBe(resource_info_vo_1.ResourceSource.OS);
            (0, vitest_1.expect)(info.isContainerized).toBe(false);
        });
        (0, vitest_1.it)('should create with available memory', () => {
            const info = resource_info_vo_1.ResourceInfo.withAvailable(8589934592, 4294967296, resource_info_vo_1.ResourceSource.OS);
            (0, vitest_1.expect)(info.totalMemoryGB).toBe(8);
            (0, vitest_1.expect)(info.availableMemory.toGB()).toBe(4);
        });
    });
    (0, vitest_1.describe)('properties', () => {
        (0, vitest_1.it)('should expose total memory', () => {
            const info = resource_info_vo_1.ResourceInfo.fromGB(16);
            (0, vitest_1.expect)(info.totalMemory.toGB()).toBe(16);
        });
        (0, vitest_1.it)('should expose available memory (defaults to total)', () => {
            const info = resource_info_vo_1.ResourceInfo.fromGB(16);
            (0, vitest_1.expect)(info.availableMemory.toGB()).toBe(16);
        });
        (0, vitest_1.it)('should expose source', () => {
            const info = resource_info_vo_1.ResourceInfo.fromOS(8589934592);
            (0, vitest_1.expect)(info.source).toBe(resource_info_vo_1.ResourceSource.OS);
        });
        (0, vitest_1.it)('should expose isContainerized', () => {
            const containerInfo = resource_info_vo_1.ResourceInfo.fromCgroup(8589934592, 1);
            (0, vitest_1.expect)(containerInfo.isContainerized).toBe(true);
            const osInfo = resource_info_vo_1.ResourceInfo.fromOS(8589934592);
            (0, vitest_1.expect)(osInfo.isContainerized).toBe(false);
        });
    });
    (0, vitest_1.describe)('isBelowThreshold', () => {
        (0, vitest_1.it)('should return true when below threshold', () => {
            const info = resource_info_vo_1.ResourceInfo.fromGB(2);
            (0, vitest_1.expect)(info.isBelowThreshold(4)).toBe(true);
        });
        (0, vitest_1.it)('should return false when above threshold', () => {
            const info = resource_info_vo_1.ResourceInfo.fromGB(8);
            (0, vitest_1.expect)(info.isBelowThreshold(4)).toBe(false);
        });
    });
    (0, vitest_1.describe)('utilization', () => {
        (0, vitest_1.it)('should be 0 when no available memory set', () => {
            const info = resource_info_vo_1.ResourceInfo.fromGB(16);
            (0, vitest_1.expect)(info.utilization()).toBe(0);
        });
        (0, vitest_1.it)('should calculate utilization', () => {
            const info = resource_info_vo_1.ResourceInfo.withAvailable(8589934592, 4294967296, resource_info_vo_1.ResourceSource.OS);
            (0, vitest_1.expect)(info.utilization()).toBe(0.5);
        });
    });
    (0, vitest_1.describe)('describe', () => {
        (0, vitest_1.it)('should return description string for container', () => {
            const info = resource_info_vo_1.ResourceInfo.fromCgroup(8589934592, 2);
            const desc = info.describe();
            (0, vitest_1.expect)(desc).toContain('CGROUP_V2');
            (0, vitest_1.expect)(desc).toContain('8.0GB');
            (0, vitest_1.expect)(desc).toContain('containerized');
        });
        (0, vitest_1.it)('should return description string for OS', () => {
            const info = resource_info_vo_1.ResourceInfo.fromOS(17179869184);
            const desc = info.describe();
            (0, vitest_1.expect)(desc).toContain('OS');
            (0, vitest_1.expect)(desc).toContain('16.0GB');
            (0, vitest_1.expect)(desc).toContain('bare metal');
        });
    });
    (0, vitest_1.describe)('toJSON', () => {
        (0, vitest_1.it)('should return JSON representation', () => {
            const info = resource_info_vo_1.ResourceInfo.fromGB(16);
            const json = info.toJSON();
            (0, vitest_1.expect)(json.totalMemoryGB).toBe(16);
            (0, vitest_1.expect)(json.source).toBe(resource_info_vo_1.ResourceSource.UNKNOWN);
            (0, vitest_1.expect)(json.isContainerized).toBe(false);
            (0, vitest_1.expect)(json.utilization).toBe(0);
        });
    });
    (0, vitest_1.describe)('validation', () => {
        (0, vitest_1.it)('should throw on zero memory', () => {
            (0, vitest_1.expect)(() => resource_info_vo_1.ResourceInfo.fromBytes(0)).toThrow();
        });
        (0, vitest_1.it)('should throw on negative memory', () => {
            (0, vitest_1.expect)(() => resource_info_vo_1.ResourceInfo.fromBytes(-1)).toThrow();
        });
        (0, vitest_1.it)('should throw when available > total', () => {
            (0, vitest_1.expect)(() => resource_info_vo_1.ResourceInfo.withAvailable(8589934592, 17179869184, resource_info_vo_1.ResourceSource.OS)).toThrow();
        });
    });
});
