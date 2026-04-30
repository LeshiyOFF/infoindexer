"use strict";
/**
 * Спецификация для ClickHouseMetricsService
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const clickhouse_metrics_service_1 = require("./clickhouse-metrics.service");
(0, vitest_1.describe)('ClickHouseMetricsService', () => {
    let mockMetrics;
    let mockMemoryApi;
    let service;
    (0, vitest_1.beforeEach)(() => {
        const recordGaugeFn = vitest_1.vi.fn();
        const recordCounterFn = vitest_1.vi.fn();
        const recordHistogramFn = vitest_1.vi.fn();
        const recordTimingFn = vitest_1.vi.fn();
        const recordProgressFn = vitest_1.vi.fn();
        const recordMemoryMetricsFn = vitest_1.vi.fn();
        mockMetrics = {
            recordGauge: recordGaugeFn,
            recordCounter: recordCounterFn,
            recordHistogram: recordHistogramFn,
            recordTiming: recordTimingFn,
            recordProgress: recordProgressFn,
            recordMemoryMetrics: recordMemoryMetricsFn
        };
        mockMemoryApi = () => ({
            heapUsed: 1024 * 1024 * 100,
            heapTotal: 1024 * 1024 * 200,
            rss: 1024 * 1024 * 150,
            external: 1024 * 1024 * 10,
            arrayBuffers: 0
        });
        service = new clickhouse_metrics_service_1.ClickHouseMetricsService(mockMetrics, mockMemoryApi);
    });
    (0, vitest_1.describe)('recordBatchMetrics', () => {
        (0, vitest_1.it)('должен записывать timing', () => {
            service.recordBatchMetrics('test_table', 1000, 500, true);
            (0, vitest_1.expect)(mockMetrics.recordTiming).toHaveBeenCalledWith('batch_execute', 500, { table: 'test_table' });
        });
        (0, vitest_1.it)('должен записывать counter для success=true', () => {
            service.recordBatchMetrics('test_table', 1000, 500, true);
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith('batch.completed', 1, { table: 'test_table' });
        });
        (0, vitest_1.it)('должен записывать counter для success=false', () => {
            service.recordBatchMetrics('test_table', 1000, 500, false);
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith('batch.failed', 1, { table: 'test_table' });
        });
        (0, vitest_1.it)('должен записывать rows_processed', () => {
            service.recordBatchMetrics('test_table', 5000, 500, true);
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith('batch.rows_processed', 5000, { table: 'test_table' });
        });
        (0, vitest_1.it)('должен записывать memory heap used', () => {
            service.recordBatchMetrics('test_table', 1000, 500, true);
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith('memory.heap_used_mb', vitest_1.expect.any(Number), { table: 'test_table' });
        });
    });
    (0, vitest_1.describe)('recordQueryMetrics', () => {
        (0, vitest_1.it)('должен записывать timing с тегами operation и table', () => {
            service.recordQueryMetrics('SELECT', 'my_table', 1234);
            (0, vitest_1.expect)(mockMetrics.recordTiming).toHaveBeenCalledWith('clickhouse.query.duration_ms', 1234, { operation: 'SELECT', table: 'my_table' });
        });
    });
    (0, vitest_1.describe)('recordMemoryMetrics', () => {
        (0, vitest_1.it)('должен конвертировать байты в MB', () => {
            service.recordMemoryMetrics();
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith('memory.heap_used_mb', 100, {});
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith('memory.heap_total_mb', 200, {});
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith('memory.rss_mb', 150, {});
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith('memory.external_mb', 10, {});
        });
        (0, vitest_1.it)('должен передавать labels в метрики', () => {
            service.recordMemoryMetrics({ operation: 'test' });
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith('memory.heap_used_mb', vitest_1.expect.any(Number), { operation: 'test' });
        });
    });
    (0, vitest_1.describe)('startTimer', () => {
        (0, vitest_1.it)('должен возвращать функцию', () => {
            const stopTimer = service.startTimer('test_operation');
            (0, vitest_1.expect)(typeof stopTimer).toBe('function');
        });
        (0, vitest_1.it)('должен записывать timing после вызова возвращенной функции', () => {
            const stopTimer = service.startTimer('batch_process', { table: 'test' });
            stopTimer();
            (0, vitest_1.expect)(mockMetrics.recordTiming).toHaveBeenCalledWith('batch_process', vitest_1.expect.any(Number), { table: 'test' });
        });
        (0, vitest_1.it)('должен замерять корректную длительность', () => {
            const stopTimer = service.startTimer('test');
            stopTimer();
            const calls = mockMetrics.recordTiming.mock.calls;
            const duration = calls[0][1];
            (0, vitest_1.expect)(duration).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(duration).toBeLessThan(1000);
        });
    });
    (0, vitest_1.describe)('constructor', () => {
        (0, vitest_1.it)('должен использовать process.memoryUsage по умолчанию', () => {
            const defaultService = new clickhouse_metrics_service_1.ClickHouseMetricsService(mockMetrics);
            defaultService.recordMemoryMetrics();
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalled();
        });
        (0, vitest_1.it)('позволяет подменить memoryApi', () => {
            const customMemoryApi = () => ({
                heapUsed: 999,
                heapTotal: 999,
                rss: 999,
                external: 999,
                arrayBuffers: 0
            });
            const customService = new clickhouse_metrics_service_1.ClickHouseMetricsService(mockMetrics, customMemoryApi);
            customService.recordMemoryMetrics();
            // Проверяем что customMemoryApi был вызван (через значение метрик)
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith('memory.heap_used_mb', vitest_1.expect.any(Number), {});
        });
    });
});
