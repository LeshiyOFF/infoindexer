/**
 * Factory: Sync Orchestrator
 *
 * @remarks
 * Создаёт оркестратор с адаптерами для зависимостей.
 *
 * Stage flow (after Migration 022 + Commit 4):
 *   IdentityMapping → Transform → Enrichment → Cleanup
 *
 * Removed: DenormalizationHandler and MergerHandler (both
 * became NO-OP after staging+transform pattern was introduced).
 * Added: TransformHandler — explicit SQL-based staging →
 * production transform.
 */

import { SyncOrchestrator } from './sync-orchestrator.service';
import {
  IdentityMappingHandler,
  TransformHandler,
  EnrichmentHandler,
  CleanupHandler
} from './sync-handlers';
import { ProgressReporterAdapter } from '../infrastructure/adapters/progress-reporter.adapter';
import { IdentityMappingAdapter } from '../infrastructure/adapters/identity-mapping.adapter';
import type { IProgressReporterPort } from '../ports/i-progress-reporter-readable.port';
import type { IdentityMappingService } from '../repositories/identity-mapping.service';
import type { ITransformService } from '../domain/ports/i-transform-service.port';
import type { ClickHouseRepository } from '../repositories/clickhouse.repository';
import type { ISyncStateStoragePort } from '../ports/i-sync-state-storage.port';
import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { ExternalEnrichmentService } from './external-enrichment.service';

export interface SyncOrchestratorDeps {
  identityMapping: IdentityMappingService;
  transformService: ITransformService;
  repository: ClickHouseRepository;
  syncStateStorage: ISyncStateStoragePort;
  progressReporter: ProgressReporter;
  enrichment?: ExternalEnrichmentService;
}

export function createSyncOrchestrator(deps: SyncOrchestratorDeps): SyncOrchestrator {
  const {
    identityMapping,
    transformService,
    repository,
    syncStateStorage,
    progressReporter,
    enrichment
  } = deps;

  const reporterPort: IProgressReporterPort = new ProgressReporterAdapter(progressReporter);
  const identityMappingPort = new IdentityMappingAdapter(identityMapping);

  return new SyncOrchestrator(
    new IdentityMappingHandler(identityMappingPort, syncStateStorage, reporterPort),
    new TransformHandler(transformService, reporterPort),
    new EnrichmentHandler(enrichment!),
    new CleanupHandler(repository)
  );
}
