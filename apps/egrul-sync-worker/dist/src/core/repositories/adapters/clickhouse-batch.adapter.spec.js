"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const clickhouse_batch_adapter_1 = require("./clickhouse-batch.adapter");
// Создаём тестовый BatchConfig с малым batch size для unit-тестов
const createTestConfig = () => ({
    batchSize: 10,
    getBatchCount: (total) => Math.ceil(total / 10),
    getOffset: (index) => index * 10,
    maxMemoryUsage: 6_000_000_000,
    maxExecutionTime: 120
});
(0, vitest_1.describe)('ClickHouseBatchAdapter', () => {
    const mockClient = {
        command: vitest_1.vi.fn().mockResolvedValue(undefined),
        query: vitest_1.vi.fn()
    };
    let adapter;
    let testConfig;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        adapter = new clickhouse_batch_adapter_1.ClickHouseBatchAdapter(mockClient);
        testConfig = createTestConfig();
    });
    const mockCount = (cnt) => {
        mockClient.query.mockResolvedValue({ json: vitest_1.vi.fn().mockResolvedValue([{ cnt }]) });
    };
    (0, vitest_1.describe)('processInBatches', () => {
        (0, vitest_1.it)('should process all batches', async () => {
            mockCount('100');
            const result = await adapter.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);
            (0, vitest_1.expect)(result.batchesProcessed).toBe(10);
            (0, vitest_1.expect)(result.totalRows).toBe(100);
        });
        (0, vitest_1.it)('should report progress after each batch', async () => {
            mockCount('50');
            const cb = vitest_1.vi.fn();
            await adapter.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig, cb);
            (0, vitest_1.expect)(cb).toHaveBeenCalledTimes(5);
            (0, vitest_1.expect)(cb).toHaveBeenLastCalledWith(vitest_1.expect.objectContaining({ batchIndex: 5, processedRows: 50, percentage: 100 }));
        });
        (0, vitest_1.it)('should replace placeholders in query', async () => {
            mockCount('30');
            await adapter.processInBatches('SELECT * FROM test LIMIT {limit:UInt32} OFFSET {offset}', testConfig);
            (0, vitest_1.expect)(mockClient.command).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ query: vitest_1.expect.stringContaining('LIMIT 10') }));
        });
        (0, vitest_1.it)('should calculate duration', async () => {
            mockCount('20');
            const result = await adapter.processInBatches('SELECT * FROM test', testConfig);
            (0, vitest_1.expect)(result.durationMs).toBeGreaterThanOrEqual(0);
        });
        (0, vitest_1.it)('should handle partial batches', async () => {
            mockCount('25');
            const result = await adapter.processInBatches('SELECT * FROM test', testConfig);
            (0, vitest_1.expect)(result.batchesProcessed).toBe(3);
            (0, vitest_1.expect)(result.totalRows).toBe(25);
        });
    });
    (0, vitest_1.describe)('getTotalRows', () => {
        (0, vitest_1.it)('should extract table name and count rows', async () => {
            mockCount('12345');
            await adapter.processInBatches('SELECT * FROM egrul_persons_raw LIMIT {limit} OFFSET {offset}', testConfig);
            (0, vitest_1.expect)(mockClient.query).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ query: 'SELECT count() as cnt FROM egrul_persons_raw' }));
        });
        (0, vitest_1.it)('should throw error if FROM clause not found', async () => {
            mockCount('10');
            await (0, vitest_1.expect)(adapter.processInBatches('INVALID QUERY', testConfig)).rejects.toThrow('Cannot determine table for row count');
        });
    });
    (0, vitest_1.describe)('buildBatchQuery', () => {
        (0, vitest_1.it)('should replace limit placeholder', async () => {
            const calls = [];
            mockClient.command.mockImplementation(({ query }) => { calls.push(query); return Promise.resolve(); });
            mockCount('10');
            await adapter.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);
            (0, vitest_1.expect)(calls[0]).toContain('LIMIT 10');
            (0, vitest_1.expect)(calls[0]).not.toContain('{limit}');
        });
        (0, vitest_1.it)('should replace offset placeholder', async () => {
            const calls = [];
            mockClient.command.mockImplementation(({ query }) => { calls.push(query); return Promise.resolve(); });
            mockCount('20');
            await adapter.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);
            (0, vitest_1.expect)(calls[1]).toContain('OFFSET 10');
            (0, vitest_1.expect)(calls[1]).not.toContain('{offset}');
        });
        (0, vitest_1.it)('should replace UInt32 placeholder with value', async () => {
            const calls = [];
            mockClient.command.mockImplementation(({ query }) => { calls.push(query); return Promise.resolve(); });
            mockCount('10');
            await adapter.processInBatches('SELECT * FROM test LIMIT {limit:UInt32} OFFSET {offset}', testConfig);
            (0, vitest_1.expect)(calls[0]).toContain('LIMIT 10');
            (0, vitest_1.expect)(calls[0]).not.toContain('{limit:UInt32}');
        });
    });
    (0, vitest_1.describe)('progress tracking', () => {
        (0, vitest_1.it)('should provide correct percentage', async () => {
            mockCount('100');
            const progresses = [];
            await adapter.processInBatches('SELECT * FROM test', testConfig, (p) => progresses.push(p));
            (0, vitest_1.expect)(progresses[0].percentage).toBeCloseTo(10, 0);
            (0, vitest_1.expect)(progresses[4].percentage).toBeCloseTo(50, 0);
            (0, vitest_1.expect)(progresses[9].percentage).toBe(100);
        });
        (0, vitest_1.it)('should cap percentage at 100', async () => {
            mockCount('15');
            const progresses = [];
            await adapter.processInBatches('SELECT * FROM test', testConfig, (p) => progresses.push(p));
            (0, vitest_1.expect)(progresses[progresses.length - 1].percentage).toBeLessThanOrEqual(100);
        });
    });
    (0, vitest_1.describe)('metrics integration', () => {
        let mockMetrics;
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
        });
        (0, vitest_1.it)('should work without metrics (backward compatibility)', async () => {
            mockCount('30');
            const adapterWithoutMetrics = new clickhouse_batch_adapter_1.ClickHouseBatchAdapter(mockClient);
            await (0, vitest_1.expect)(adapterWithoutMetrics.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig)).resolves.toBeDefined();
        });
        (0, vitest_1.it)('should record metrics when collector is provided', async () => {
            mockCount('20');
            const adapterWithMetrics = new clickhouse_batch_adapter_1.ClickHouseBatchAdapter(mockClient, mockMetrics);
            await adapterWithMetrics.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);
            (0, vitest_1.expect)(mockMetrics.recordTiming).toHaveBeenCalledWith('batch_execute', vitest_1.expect.any(Number), vitest_1.expect.objectContaining({ table: 'test' }));
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith('batch.rows_processed', 10, { table: 'test' });
            (0, vitest_1.expect)(mockMetrics.recordProgress).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should record error counter on failure', async () => {
            mockCount('10');
            mockClient.command.mockRejectedValueOnce(new Error('Query failed'));
            const adapterWithMetrics = new clickhouse_batch_adapter_1.ClickHouseBatchAdapter(mockClient, mockMetrics);
            await (0, vitest_1.expect)(adapterWithMetrics.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig)).rejects.toThrow();
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith('batch.errors', 1, vitest_1.expect.objectContaining({ table: 'test', error: 'Error' }));
        });
        (0, vitest_1.it)('should record final metrics on completion', async () => {
            mockCount('30');
            const adapterWithMetrics = new clickhouse_batch_adapter_1.ClickHouseBatchAdapter(mockClient, mockMetrics);
            await adapterWithMetrics.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith('batch.total', 3, { table: 'test', status: 'success' });
            (0, vitest_1.expect)(mockMetrics.recordTiming).toHaveBeenCalledWith('batch.total_duration_ms', vitest_1.expect.any(Number), { table: 'test' });
            (0, vitest_1.expect)(mockMetrics.recordMemoryMetrics).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ operation: 'batch_complete', table: 'test' }));
        });
        (0, vitest_1.it)('should extract table name from query', async () => {
            mockCount('10');
            const adapterWithMetrics = new clickhouse_batch_adapter_1.ClickHouseBatchAdapter(mockClient, mockMetrics);
            await adapterWithMetrics.processInBatches('SELECT * FROM egrul_persons_raw LIMIT {limit} OFFSET {offset}', testConfig);
            (0, vitest_1.expect)(mockMetrics.recordTiming).toHaveBeenCalledWith('batch_execute', vitest_1.expect.any(Number), { table: 'egrul_persons_raw', batch_index: '0' });
        });
    });
});
