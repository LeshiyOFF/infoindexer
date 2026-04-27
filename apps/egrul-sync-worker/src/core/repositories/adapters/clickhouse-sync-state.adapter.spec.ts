import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClickHouseSyncStateAdapter } from './clickhouse-sync-state.adapter';

describe('ClickHouseSyncStateAdapter', () => {
  const mockClient = {
    query: vi.fn(),
    insert: vi.fn()
  };

  let adapter: ClickHouseSyncStateAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new ClickHouseSyncStateAdapter(mockClient as any);
  });

  describe('getLastSyncTimestamp', () => {
    it('should return null when no sync records exist', async () => {
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([])
      });

      const result = await adapter.getLastSyncTimestamp('identity_mapping');

      expect(result).toBeNull();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('WHERE sync_type = {sync_type:String}')
        })
      );
    });

    it('should return timestamp from last sync record', async () => {
      const expectedDate = new Date('2026-04-23T10:00:00Z');
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ last_sync_at: expectedDate.toISOString() }])
      });

      const result = await adapter.getLastSyncTimestamp('identity_mapping');

      expect(result).toEqual(expectedDate);
    });
  });

  describe('saveSyncTimestamp', () => {
    it('should insert sync timestamp', async () => {
      const timestamp = new Date('2026-04-23T10:00:00Z');
      mockClient.insert.mockResolvedValue(undefined);

      await adapter.saveSyncTimestamp('identity_mapping', timestamp);

      expect(mockClient.insert).toHaveBeenCalledWith({
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

  describe('saveSyncResult', () => {
    it('should insert sync result with metrics', async () => {
      const timestamp = new Date('2026-04-23T10:00:00Z');
      mockClient.insert.mockResolvedValue(undefined);

      await adapter.saveSyncResult('identity_mapping', timestamp, 1000, 5000);

      expect(mockClient.insert).toHaveBeenCalledWith({
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

  describe('getRecordsProcessed', () => {
    it('should return 0 when no sync records exist', async () => {
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([])
      });

      const result = await adapter.getRecordsProcessed('identity_mapping');

      expect(result).toBe(0);
    });

    it('should return records processed from last sync', async () => {
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ records_processed: 5000 }])
      });

      const result = await adapter.getRecordsProcessed('identity_mapping');

      expect(result).toBe(5000);
    });
  });
});
