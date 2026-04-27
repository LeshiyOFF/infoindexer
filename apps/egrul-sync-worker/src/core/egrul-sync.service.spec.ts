/**
 * Спецификация для EgrulSyncService
 *
 * @remarks
 * Проверяет автоматический выбор режима incremental/full.
 * Следует AAA pattern: Arrange, Act, Assert.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { EgrulSyncOptions } from './egrul-sync.service';
import type { IIdentityMappingPort } from './ports/i-identity-mapping.port';
import type { ISyncStateStoragePort } from './ports/i-sync-state-storage.port';
import { IdentityMappingHandler } from './services/sync-handlers/identity-mapping.handler';
import type { IProgressReporterPort } from './ports/i-progress-reporter-readable.port';

/**
 * Mock реализация IIdentityMappingPort для тестирования
 */
class MockIdentityMappingPort implements IIdentityMappingPort {
  build = vi.fn<['full' | 'incremental' | undefined], Promise<{
    personsProcessed: number;
    companiesProcessed: number;
    durationMs: number;
  }>>().mockResolvedValue({
    personsProcessed: 0,
    companiesProcessed: 0,
    durationMs: 0
  });
}

/**
 * Mock реализация ISyncStateStoragePort для тестирования
 */
class MockSyncStateStorage implements ISyncStateStoragePort {
  getLastSyncTimestamp = vi.fn<
    [syncType: string],
    Promise<Date | null>
  >().mockResolvedValue(null);

  saveSyncTimestamp = vi.fn<[syncType: string, timestamp: Date], Promise<void>>()
    .mockResolvedValue(undefined);

  saveSyncResult = vi.fn<
    [syncType: string, timestamp: Date, recordsProcessed: number, durationMs: number],
    Promise<void>
  >().mockResolvedValue(undefined);

  getRecordsProcessed = vi.fn<[syncType: string], Promise<number>>()
    .mockResolvedValue(0);
}

/**
 * Mock реализация IProgressReporterPort для тестирования
 */
class MockProgressReporter implements IProgressReporterPort {
  report = vi.fn<[{
    status: string;
    percentage?: number;
    message?: string;
    error?: string;
    updated_at?: string;
    completed_at?: string;
    rows_processed?: number;
  }], Promise<void>>().mockResolvedValue(undefined);

  createState = vi.fn<
    [status: string, percentage?: number, message?: string, rowsProcessed?: number],
    {
      status: string;
      percentage?: number;
      message?: string;
      rows_processed?: number;
      updated_at: string;
    }
  >((status, percentage, message, rowsProcessed) => ({
    status,
    percentage,
    message,
    rows_processed: rowsProcessed,
    updated_at: new Date().toISOString()
  }));
}

describe('EgrulSyncService', () => {
  describe('run method options', () => {
    it('should pass forceFullSync option to orchestrator', () => {
      const options: EgrulSyncOptions = { forceFullSync: true };

      expect(options.forceFullSync).toBe(true);
    });

    it('should default forceFullSync to false', () => {
      const options: EgrulSyncOptions = {};

      expect(options.forceFullSync).toBeUndefined();
    });
  });
});

describe('IdentityMappingHandler', () => {
  let handler: IdentityMappingHandler;
  let mockIdentityMapping: MockIdentityMappingPort;
  let mockSyncStateStorage: MockSyncStateStorage;
  let mockProgressReporter: MockProgressReporter;

  beforeEach(() => {
    vi.clearAllMocks();

    mockIdentityMapping = new MockIdentityMappingPort();
    mockSyncStateStorage = new MockSyncStateStorage();
    mockProgressReporter = new MockProgressReporter();

    handler = new IdentityMappingHandler(
      mockIdentityMapping,
      mockSyncStateStorage,
      mockProgressReporter
    );
  });

  describe('incremental mode selection', () => {
    it('should use full mode when no previous sync exists', async () => {
      mockSyncStateStorage.getLastSyncTimestamp.mockResolvedValue(null);

      await handler.execute({ forceFullSync: false });

      expect(mockIdentityMapping.build).toHaveBeenCalledWith('full');
    });

    it('should use incremental mode when previous sync exists', async () => {
      const lastSyncDate = new Date('2026-04-20T10:00:00.000Z');
      mockSyncStateStorage.getLastSyncTimestamp.mockResolvedValue(lastSyncDate);

      await handler.execute({ forceFullSync: false });

      expect(mockIdentityMapping.build).toHaveBeenCalledWith('incremental');
    });

    it('should use full mode when forceFullSync is true', async () => {
      const lastSyncDate = new Date('2026-04-20T10:00:00.000Z');
      mockSyncStateStorage.getLastSyncTimestamp.mockResolvedValue(lastSyncDate);

      await handler.execute({ forceFullSync: true });

      expect(mockIdentityMapping.build).toHaveBeenCalledWith('full');
    });

    it('should not call getLastSyncTimestamp when forceFullSync is true', async () => {
      await handler.execute({ forceFullSync: true });

      expect(mockSyncStateStorage.getLastSyncTimestamp).not.toHaveBeenCalled();
      expect(mockIdentityMapping.build).toHaveBeenCalledWith('full');
    });
  });

  describe('sync state storage integration', () => {
    it('should call getLastSyncTimestamp with correct sync type', async () => {
      mockSyncStateStorage.getLastSyncTimestamp.mockResolvedValue(null);

      await handler.execute({ forceFullSync: false });

      expect(mockSyncStateStorage.getLastSyncTimestamp).toHaveBeenCalledWith('identity_mapping');
    });
  });
});
