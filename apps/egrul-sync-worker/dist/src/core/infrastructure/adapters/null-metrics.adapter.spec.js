"use strict";
/**
 * Спецификация для NullMetricsAdapter
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const null_metrics_adapter_1 = require("./null-metrics.adapter");
(0, vitest_1.describe)('NullMetricsAdapter', () => {
    let adapter;
    (0, vitest_1.beforeEach)(() => {
        adapter = new null_metrics_adapter_1.NullMetricsAdapter();
    });
    (0, vitest_1.describe)('recordGauge', () => {
        (0, vitest_1.it)('не должен выбрасывать ошибку', () => {
            (0, vitest_1.expect)(() => adapter.recordGauge('test', 100)).not.toThrow();
        });
        (0, vitest_1.it)('должен принимать любые параметры', () => {
            (0, vitest_1.expect)(() => adapter.recordGauge('', NaN, undefined)).not.toThrow();
            (0, vitest_1.expect)(() => adapter.recordGauge('test', -1, { a: 'b' })).not.toThrow();
        });
    });
    (0, vitest_1.describe)('recordCounter', () => {
        (0, vitest_1.it)('не должен выбрасывать ошибку', () => {
            (0, vitest_1.expect)(() => adapter.recordCounter('test', 1)).not.toThrow();
        });
        (0, vitest_1.it)('должен принимать любые параметры', () => {
            (0, vitest_1.expect)(() => adapter.recordCounter('', 0)).not.toThrow();
            (0, vitest_1.expect)(() => adapter.recordCounter('test', Infinity, {})).not.toThrow();
        });
    });
    (0, vitest_1.describe)('recordHistogram', () => {
        (0, vitest_1.it)('не должен выбрасывать ошибку', () => {
            (0, vitest_1.expect)(() => adapter.recordHistogram('test', 50)).not.toThrow();
        });
        (0, vitest_1.it)('должен принимать любые параметры', () => {
            (0, vitest_1.expect)(() => adapter.recordHistogram('', -100)).not.toThrow();
        });
    });
    (0, vitest_1.describe)('recordTiming', () => {
        (0, vitest_1.it)('не должен выбрасывать ошибку', () => {
            (0, vitest_1.expect)(() => adapter.recordTiming('test', 1000)).not.toThrow();
        });
        (0, vitest_1.it)('должен принимать любые параметры', () => {
            (0, vitest_1.expect)(() => adapter.recordTiming('', -1)).not.toThrow();
            (0, vitest_1.expect)(() => adapter.recordTiming('test', 0, { tag: 'value' })).not.toThrow();
        });
    });
    (0, vitest_1.describe)('recordProgress', () => {
        (0, vitest_1.it)('не должен выбрасывать ошибку', () => {
            (0, vitest_1.expect)(() => adapter.recordProgress('test', 50)).not.toThrow();
        });
        (0, vitest_1.it)('должен принимать любые параметры', () => {
            (0, vitest_1.expect)(() => adapter.recordProgress('', -100)).not.toThrow();
            (0, vitest_1.expect)(() => adapter.recordProgress('test', 1000)).not.toThrow();
        });
    });
    (0, vitest_1.describe)('recordMemoryMetrics', () => {
        (0, vitest_1.it)('не должен выбрасывать ошибку', () => {
            (0, vitest_1.expect)(() => adapter.recordMemoryMetrics({})).not.toThrow();
        });
        (0, vitest_1.it)('должен принимать любые параметры', () => {
            (0, vitest_1.expect)(() => adapter.recordMemoryMetrics({ test: 'value' })).not.toThrow();
        });
    });
    (0, vitest_1.describe)('null object behaviour', () => {
        (0, vitest_1.it)('все методы должны быть no-op', () => {
            adapter.recordGauge('a', 1);
            adapter.recordCounter('b', 2);
            adapter.recordHistogram('c', 3);
            adapter.recordTiming('d', 4);
            adapter.recordProgress('e', 5);
            adapter.recordMemoryMetrics({});
            // Никаких side effects не происходит
            (0, vitest_1.expect)(adapter).toBeDefined();
        });
    });
});
