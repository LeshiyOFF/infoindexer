"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const clickhouse_incremental_adapter_1 = require("./clickhouse-incremental.adapter");
(0, vitest_1.describe)('ClickHouseIncrementalAdapter', () => {
    const mockClient = {
        command: vitest_1.vi.fn().mockResolvedValue(undefined),
        query: vitest_1.vi.fn()
    };
    const mockBatchProcessor = {
        processInBatches: vitest_1.vi.fn()
    };
    const mockSyncState = {
        getLastSyncTimestamp: vitest_1.vi.fn().mockResolvedValue(null),
        saveSyncTimestamp: vitest_1.vi.fn().mockResolvedValue(undefined),
        saveSyncResult: vitest_1.vi.fn().mockResolvedValue(undefined),
        getRecordsProcessed: vitest_1.vi.fn().mockResolvedValue(0)
    };
    let adapter;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockSyncState.getLastSyncTimestamp.mockResolvedValue(null);
        adapter = new clickhouse_incremental_adapter_1.ClickHouseIncrementalAdapter(mockClient, mockBatchProcessor, mockSyncState);
    });
    (0, vitest_1.describe)('build', () => {
        (0, vitest_1.it)('should call buildFull for full mode', async () => {
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ cnt: '100' }])
            });
            await adapter.build('full');
            (0, vitest_1.expect)(mockClient.command).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                query: 'TRUNCATE TABLE IF EXISTS egrul_identity_mapping'
            }));
        });
        (0, vitest_1.it)('should call buildIncremental for incremental mode', async () => {
            const since = new Date('2026-04-23T10:00:00Z');
            mockSyncState.getLastSyncTimestamp.mockResolvedValue(since);
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ cnt: '50' }])
            });
            await adapter.build('incremental');
            (0, vitest_1.expect)(mockSyncState.getLastSyncTimestamp).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should use provided since for incremental mode', async () => {
            const since = new Date('2026-04-20T10:00:00Z');
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ cnt: '25' }])
            });
            await adapter.build('incremental', since);
            (0, vitest_1.expect)(mockSyncState.getLastSyncTimestamp).not.toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('buildFull', () => {
        (0, vitest_1.it)('should save sync result after full build', async () => {
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ cnt: '100' }])
            });
            await adapter.build('full');
            (0, vitest_1.expect)(mockSyncState.saveSyncResult).toHaveBeenCalledWith('identity_mapping', vitest_1.expect.any(Date), vitest_1.expect.any(Number), vitest_1.expect.any(Number));
        });
        (0, vitest_1.it)('should clear table before insert', async () => {
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ cnt: '100' }])
            });
            await adapter.build('full');
            (0, vitest_1.expect)(mockClient.command).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                query: 'TRUNCATE TABLE IF EXISTS egrul_identity_mapping'
            }));
        });
    });
    (0, vitest_1.describe)('buildIncremental', () => {
        (0, vitest_1.it)('should filter records by first_seen', async () => {
            const since = new Date('2026-04-23T10:00:00Z');
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ cnt: '10' }])
            });
            await adapter.build('incremental', since);
            // Проверяем что запросы содержат WHERE first_seen > {since:DateTime}
            const calls = mockClient.command.mock.calls;
            const insertCalls = calls.filter(call => call[0].query.includes('INSERT INTO egrul_identity_mapping'));
            (0, vitest_1.expect)(insertCalls.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(insertCalls[0][0].query).toContain('WHERE first_seen > {since:DateTime}');
        });
        (0, vitest_1.it)('should save sync result after incremental build', async () => {
            const since = new Date('2026-04-23T10:00:00Z');
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ cnt: '5' }])
            });
            await adapter.build('incremental', since);
            (0, vitest_1.expect)(mockSyncState.saveSyncResult).toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('query building', () => {
        (0, vitest_1.it)('should include WHERE clause in incremental queries', async () => {
            const since = new Date('2026-04-23T10:00:00Z');
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ cnt: '0' }])
            });
            await adapter.build('incremental', since);
            const calls = mockClient.command.mock.calls;
            (0, vitest_1.expect)(calls.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should not include WHERE clause in full queries', async () => {
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ cnt: '0' }])
            });
            await adapter.build('full');
            const calls = mockClient.command.mock.calls;
            calls.forEach(call => {
                if (call[0].query.includes('INSERT INTO egrul_identity_mapping')) {
                    (0, vitest_1.expect)(call[0].query).not.toContain('WHERE');
                }
            });
        });
    });
});
