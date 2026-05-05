/**
 * Staging Sync Service
 *
 * @remarks
 * Thin coordinator over staging storage. Currently exposes
 * a single operation — clearStaging — used during sync abort
 * to reset staging tables.
 *
 * Historical note: this service previously included a
 * processBatch method that orchestrated insert + transform
 * in one call. After Migration 022 + Commit 4 the architecture
 * separated these concerns: parser writes to staging via
 * BatchFlusher, transform runs from SyncOrchestrator via
 * TransformHandler. processBatch became dead code and was
 * removed.
 */
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';

export class StagingSyncService {
  constructor(
    private readonly stagingStorage: IStagingStoragePort
  ) {}

  /**
   * Clears all staging tables. Used during sync abort.
   */
  async clearStaging(): Promise<void> {
    await this.stagingStorage.truncateAll();
  }
}
