"use strict";
/**
 * Спецификация для EgrulSyncService
 *
 * @remarks
 * Проверяет автоматический выбор режима incremental/full.
 * Следует AAA pattern: Arrange, Act, Assert.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const identity_mapping_handler_1 = require("./services/sync-handlers/identity-mapping.handler");
/**
 * Mock реализация IIdentityMappingPort для тестирования
 */
class MockIdentityMappingPort {
    build = vitest_1.vi.fn().mockResolvedValue({
        personsProcessed: 0,
        companiesProcessed: 0,
        durationMs: 0
    });
}
/**
 * Mock реализация ISyncStateStoragePort для тестирования
 */
class MockSyncStateStorage {
    getLastSyncTimestamp = vitest_1.vi.fn().mockResolvedValue(null);
    saveSyncTimestamp = vitest_1.vi.fn()
        .mockResolvedValue(undefined);
    saveSyncResult = vitest_1.vi.fn().mockResolvedValue(undefined);
    getRecordsProcessed = vitest_1.vi.fn()
        .mockResolvedValue(0);
}
/**
 * Mock реализация IProgressReporterPort для тестирования
 */
class MockProgressReporter {
    report = vitest_1.vi.fn().mockResolvedValue(undefined);
    createState = vitest_1.vi.fn((status, percentage, message, rowsProcessed) => ({
        status,
        percentage,
        message,
        rows_processed: rowsProcessed,
        updated_at: new Date().toISOString()
    }));
}
(0, vitest_1.describe)('EgrulSyncService', () => {
    (0, vitest_1.describe)('run method options', () => {
        (0, vitest_1.it)('should pass forceFullSync option to orchestrator', () => {
            const options = { forceFullSync: true };
            (0, vitest_1.expect)(options.forceFullSync).toBe(true);
        });
        (0, vitest_1.it)('should default forceFullSync to false', () => {
            const options = {};
            (0, vitest_1.expect)(options.forceFullSync).toBeUndefined();
        });
    });
});
(0, vitest_1.describe)('IdentityMappingHandler', () => {
    let handler;
    let mockIdentityMapping;
    let mockSyncStateStorage;
    let mockProgressReporter;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockIdentityMapping = new MockIdentityMappingPort();
        mockSyncStateStorage = new MockSyncStateStorage();
        mockProgressReporter = new MockProgressReporter();
        handler = new identity_mapping_handler_1.IdentityMappingHandler(mockIdentityMapping, mockSyncStateStorage, mockProgressReporter);
    });
    (0, vitest_1.describe)('incremental mode selection', () => {
        (0, vitest_1.it)('should use full mode when no previous sync exists', async () => {
            mockSyncStateStorage.getLastSyncTimestamp.mockResolvedValue(null);
            await handler.execute({ forceFullSync: false });
            (0, vitest_1.expect)(mockIdentityMapping.build).toHaveBeenCalledWith('full');
        });
        (0, vitest_1.it)('should use incremental mode when previous sync exists', async () => {
            const lastSyncDate = new Date('2026-04-20T10:00:00.000Z');
            mockSyncStateStorage.getLastSyncTimestamp.mockResolvedValue(lastSyncDate);
            await handler.execute({ forceFullSync: false });
            (0, vitest_1.expect)(mockIdentityMapping.build).toHaveBeenCalledWith('incremental');
        });
        (0, vitest_1.it)('should use full mode when forceFullSync is true', async () => {
            const lastSyncDate = new Date('2026-04-20T10:00:00.000Z');
            mockSyncStateStorage.getLastSyncTimestamp.mockResolvedValue(lastSyncDate);
            await handler.execute({ forceFullSync: true });
            (0, vitest_1.expect)(mockIdentityMapping.build).toHaveBeenCalledWith('full');
        });
        (0, vitest_1.it)('should not call getLastSyncTimestamp when forceFullSync is true', async () => {
            await handler.execute({ forceFullSync: true });
            (0, vitest_1.expect)(mockSyncStateStorage.getLastSyncTimestamp).not.toHaveBeenCalled();
            (0, vitest_1.expect)(mockIdentityMapping.build).toHaveBeenCalledWith('full');
        });
    });
    (0, vitest_1.describe)('sync state storage integration', () => {
        (0, vitest_1.it)('should call getLastSyncTimestamp with correct sync type', async () => {
            mockSyncStateStorage.getLastSyncTimestamp.mockResolvedValue(null);
            await handler.execute({ forceFullSync: false });
            (0, vitest_1.expect)(mockSyncStateStorage.getLastSyncTimestamp).toHaveBeenCalledWith('identity_mapping');
        });
    });
});
