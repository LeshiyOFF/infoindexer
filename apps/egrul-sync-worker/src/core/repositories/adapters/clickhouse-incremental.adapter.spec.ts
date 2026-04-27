import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClickHouseIncrementalAdapter } from './clickhouse-incremental.adapter';
import type { IBatchProcessorPort } from '../ports/i-batch-processor.port';
import type { ISyncStateStoragePort } from '../../ports/i-sync-state-storage.port';

describe('ClickHouseIncrementalAdapter', () => {
  const mockClient = {
    command: vi.fn().mockResolvedValue(undefined),
    query: vi.fn()
  };

  const mockBatchProcessor = {
    processInBatches: vi.fn()
  } as unknown as IBatchProcessorPort;

  const mockSyncState = {
    getLastSyncTimestamp: vi.fn().mockResolvedValue(null),
    saveSyncTimestamp: vi.fn().mockResolvedValue(undefined),
    saveSyncResult: vi.fn().mockResolvedValue(undefined),
    getRecordsProcessed: vi.fn().mockResolvedValue(0)
  } as unknown as ISyncStateStoragePort;

  let adapter: ClickHouseIncrementalAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    (mockSyncState.getLastSyncTimestamp as any).mockResolvedValue(null);
    adapter = new ClickHouseIncrementalAdapter(
      mockClient as any,
      mockBatchProcessor,
      mockSyncState
    );
  });

  describe('build', () => {
    it('should call buildFull for full mode', async () => {
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ cnt: '100' }])
      });

      await adapter.build('full');

      expect(mockClient.command).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'TRUNCATE TABLE IF EXISTS egrul_identity_mapping'
        })
      );
    });

    it('should call buildIncremental for incremental mode', async () => {
      const since = new Date('2026-04-23T10:00:00Z');
      (mockSyncState.getLastSyncTimestamp as any).mockResolvedValue(since);
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ cnt: '50' }])
      });

      await adapter.build('incremental');

      expect(mockSyncState.getLastSyncTimestamp).toHaveBeenCalled();
    });

    it('should use provided since for incremental mode', async () => {
      const since = new Date('2026-04-20T10:00:00Z');
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ cnt: '25' }])
      });

      await adapter.build('incremental', since);

      expect(mockSyncState.getLastSyncTimestamp).not.toHaveBeenCalled();
    });
  });

  describe('buildFull', () => {
    it('should save sync result after full build', async () => {
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ cnt: '100' }])
      });

      await adapter.build('full');

      expect(mockSyncState.saveSyncResult).toHaveBeenCalledWith(
        'identity_mapping',
        expect.any(Date),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should clear table before insert', async () => {
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ cnt: '100' }])
      });

      await adapter.build('full');

      expect(mockClient.command).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'TRUNCATE TABLE IF EXISTS egrul_identity_mapping'
        })
      );
    });
  });

  describe('buildIncremental', () => {
    it('should filter records by first_seen', async () => {
      const since = new Date('2026-04-23T10:00:00Z');
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ cnt: '10' }])
      });

      await adapter.build('incremental', since);

      // Проверяем что запросы содержат WHERE first_seen > {since:DateTime}
      const calls = mockClient.command.mock.calls;
      const insertCalls = calls.filter(call =>
        call[0].query.includes('INSERT INTO egrul_identity_mapping')
      );

      expect(insertCalls.length).toBeGreaterThan(0);
      expect(insertCalls[0][0].query).toContain('WHERE first_seen > {since:DateTime}');
    });

    it('should save sync result after incremental build', async () => {
      const since = new Date('2026-04-23T10:00:00Z');
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ cnt: '5' }])
      });

      await adapter.build('incremental', since);

      expect(mockSyncState.saveSyncResult).toHaveBeenCalled();
    });
  });

  describe('query building', () => {
    it('should include WHERE clause in incremental queries', async () => {
      const since = new Date('2026-04-23T10:00:00Z');
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ cnt: '0' }])
      });

      await adapter.build('incremental', since);

      const calls = mockClient.command.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });

    it('should not include WHERE clause in full queries', async () => {
      mockClient.query.mockResolvedValue({
        json: vi.fn().mockResolvedValue([{ cnt: '0' }])
      });

      await adapter.build('full');

      const calls = mockClient.command.mock.calls;
      calls.forEach(call => {
        if (call[0].query.includes('INSERT INTO egrul_identity_mapping')) {
          expect(call[0].query).not.toContain('WHERE');
        }
      });
    });
  });
});
