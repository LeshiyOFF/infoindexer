"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const clickhouse_sync_state_adapter_1 = require("./clickhouse-sync-state.adapter");
(0, vitest_1.describe)('ClickHouseSyncStateAdapter', () => {
    const mockClient = {
        query: vitest_1.vi.fn(),
        insert: vitest_1.vi.fn()
    };
    let adapter;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        adapter = new clickhouse_sync_state_adapter_1.ClickHouseSyncStateAdapter(mockClient);
    });
    (0, vitest_1.describe)('getLastSyncTimestamp', () => {
        (0, vitest_1.it)('should return null when no sync records exist', async () => {
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([])
            });
            const result = await adapter.getLastSyncTimestamp('identity_mapping');
            (0, vitest_1.expect)(result).toBeNull();
            (0, vitest_1.expect)(mockClient.query).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                query: vitest_1.expect.stringContaining('WHERE sync_type = {sync_type:String}')
            }));
        });
        (0, vitest_1.it)('should return timestamp from last sync record', async () => {
            const expectedDate = new Date('2026-04-23T10:00:00Z');
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ last_sync_at: expectedDate.toISOString() }])
            });
            const result = await adapter.getLastSyncTimestamp('identity_mapping');
            (0, vitest_1.expect)(result).toEqual(expectedDate);
        });
    });
    (0, vitest_1.describe)('saveSyncTimestamp', () => {
        (0, vitest_1.it)('should insert sync timestamp', async () => {
            const timestamp = new Date('2026-04-23T10:00:00Z');
            mockClient.insert.mockResolvedValue(undefined);
            await adapter.saveSyncTimestamp('identity_mapping', timestamp);
            (0, vitest_1.expect)(mockClient.insert).toHaveBeenCalledWith({
                table: 'egrul_sync_state',
                values: [{
                        sync_type: 'identity_mapping',
                        last_sync_at: timestamp,
                        records_processed: 0,
                        duration_ms: 0
                    }],
                format: 'JSONEachRow'
            });
        });
    });
    (0, vitest_1.describe)('saveSyncResult', () => {
        (0, vitest_1.it)('should insert sync result with metrics', async () => {
            const timestamp = new Date('2026-04-23T10:00:00Z');
            mockClient.insert.mockResolvedValue(undefined);
            await adapter.saveSyncResult('identity_mapping', timestamp, 1000, 5000);
            (0, vitest_1.expect)(mockClient.insert).toHaveBeenCalledWith({
                table: 'egrul_sync_state',
                values: [{
                        sync_type: 'identity_mapping',
                        last_sync_at: timestamp,
                        records_processed: 1000,
                        duration_ms: 5000
                    }],
                format: 'JSONEachRow'
            });
        });
    });
    (0, vitest_1.describe)('getRecordsProcessed', () => {
        (0, vitest_1.it)('should return 0 when no sync records exist', async () => {
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([])
            });
            const result = await adapter.getRecordsProcessed('identity_mapping');
            (0, vitest_1.expect)(result).toBe(0);
        });
        (0, vitest_1.it)('should return records processed from last sync', async () => {
            mockClient.query.mockResolvedValue({
                json: vitest_1.vi.fn().mockResolvedValue([{ records_processed: 5000 }])
            });
            const result = await adapter.getRecordsProcessed('identity_mapping');
            (0, vitest_1.expect)(result).toBe(5000);
        });
    });
});
