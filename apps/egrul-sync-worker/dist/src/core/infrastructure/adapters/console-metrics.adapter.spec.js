"use strict";
/**
 * Спецификация для ConsoleMetricsAdapter
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const console_metrics_adapter_1 = require("./console-metrics.adapter");
(0, vitest_1.describe)('ConsoleMetricsAdapter', () => {
    let adapter;
    const logs = [];
    (0, vitest_1.beforeEach)(() => {
        logs.length = 0;
        vitest_1.vi.spyOn(console, 'log').mockImplementation((msg) => {
            logs.push(String(msg));
        });
        adapter = new console_metrics_adapter_1.ConsoleMetricsAdapter();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.describe)('recordGauge', () => {
        (0, vitest_1.it)('должен выводить формат [METRIC] 📊 GAUGE name=value', () => {
            adapter.recordGauge('test.metric', 123.45);
            (0, vitest_1.expect)(logs).toHaveLength(1);
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('[METRIC]');
            (0, vitest_1.expect)(output).toContain('📊');
            (0, vitest_1.expect)(output).toContain('GAUGE');
            (0, vitest_1.expect)(output).toContain('test.metric=123.45');
        });
        (0, vitest_1.it)('должен выводить теги в формате {key:value}', () => {
            adapter.recordGauge('test.metric', 100, { tag1: 'value1', tag2: 'value2' });
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('{tag1:value1,tag2:value2}');
        });
        (0, vitest_1.it)('должен работать без тегов', () => {
            adapter.recordGauge('test.metric', 100);
            const output = logs[0];
            (0, vitest_1.expect)(output).not.toContain('{');
        });
    });
    (0, vitest_1.describe)('recordCounter', () => {
        (0, vitest_1.it)('должен выводить формат [METRIC] 🔢 COUNTER name=value', () => {
            adapter.recordCounter('test.counter', 1);
            (0, vitest_1.expect)(logs).toHaveLength(1);
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('[METRIC]');
            (0, vitest_1.expect)(output).toContain('🔢');
            (0, vitest_1.expect)(output).toContain('COUNTER');
            (0, vitest_1.expect)(output).toContain('test.counter=1');
        });
        (0, vitest_1.it)('должен выводить теги', () => {
            adapter.recordCounter('test.counter', 5, { service: 'worker' });
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('{service:worker}');
        });
    });
    (0, vitest_1.describe)('recordHistogram', () => {
        (0, vitest_1.it)('должен выводить формат [METRIC] 📈 HISTOGRAM name=value', () => {
            adapter.recordHistogram('test.histogram', 42);
            (0, vitest_1.expect)(logs).toHaveLength(1);
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('[METRIC]');
            (0, vitest_1.expect)(output).toContain('📈');
            (0, vitest_1.expect)(output).toContain('HISTOGRAM');
            (0, vitest_1.expect)(output).toContain('test.histogram=42');
        });
    });
    (0, vitest_1.describe)('recordTiming', () => {
        (0, vitest_1.it)('должен добавлять суффикс _duration_ms', () => {
            adapter.recordTiming('batch_process', 1234);
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('batch_process_duration_ms=1234');
        });
        (0, vitest_1.it)('должен использовать иконку таймера', () => {
            adapter.recordTiming('test', 100);
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('⏱️');
        });
    });
    (0, vitest_1.describe)('recordProgress', () => {
        (0, vitest_1.it)('должен добавлять суффикс _progress_pct', () => {
            adapter.recordProgress('batch', 50);
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('batch_progress_pct=50');
        });
        (0, vitest_1.it)('должен clamp значение между 0 и 100', () => {
            adapter.recordProgress('batch', -10);
            (0, vitest_1.expect)(logs[0]).toContain('batch_progress_pct=0');
            adapter.recordProgress('batch', 150);
            (0, vitest_1.expect)(logs[1]).toContain('batch_progress_pct=100');
        });
        (0, vitest_1.it)('должен использовать иконку прогресса', () => {
            adapter.recordProgress('batch', 75);
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('📊');
        });
    });
    (0, vitest_1.describe)('recordMemoryMetrics', () => {
        (0, vitest_1.it)('должен записывать heap_used_mb', () => {
            adapter.recordMemoryMetrics({ test: 'value' });
            (0, vitest_1.expect)(logs.length).toBeGreaterThan(0);
            const output = logs.join(' ');
            (0, vitest_1.expect)(output).toContain('memory.heap_used_mb');
        });
        (0, vitest_1.it)('должен записывать heap_total_mb', () => {
            adapter.recordMemoryMetrics({});
            const output = logs.join(' ');
            (0, vitest_1.expect)(output).toContain('memory.heap_total_mb');
        });
        (0, vitest_1.it)('должен записывать rss_mb', () => {
            adapter.recordMemoryMetrics({});
            const output = logs.join(' ');
            (0, vitest_1.expect)(output).toContain('memory.rss_mb');
        });
    });
    (0, vitest_1.describe)('formatTags (private behaviour)', () => {
        (0, vitest_1.it)('должен возвращать пустую строку для undefined', () => {
            adapter.recordGauge('test', 1);
            const output = logs[0];
            (0, vitest_1.expect)(output).toMatch(/test=1\s*$/);
        });
        (0, vitest_1.it)('должен форматировать один тег', () => {
            adapter.recordGauge('test', 1, { key: 'value' });
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('{key:value}');
        });
        (0, vitest_1.it)('должен форматировать несколько тегов', () => {
            adapter.recordGauge('test', 1, { k1: 'v1', k2: 'v2', k3: 'v3' });
            const output = logs[0];
            (0, vitest_1.expect)(output).toContain('{k1:v1,k2:v2,k3:v3}');
        });
    });
});
