/**
 * Factory: Sync Orchestrator
 *
 * @remarks
 * Создаёт оркестратор с адаптерами для зависимостей.
 */

import { SyncOrchestrator } from './sync-orchestrator.service';
import {
  IdentityMappingHandler,
  DenormalizationHandler,
  EnrichmentHandler,
  MergerHandler,
  CleanupHandler
} from './sync-handlers';
import { ProgressReporterAdapter } from '../infrastructure/adapters/progress-reporter.adapter';
import { IdentityMappingAdapter } from '../infrastructure/adapters/identity-mapping.adapter';
import type { IProgressReporterPort } from '../ports/i-progress-reporter-readable.port';
import type { IdentityMappingService } from '../repositories/identity-mapping.service';
import type { DenormalizationService } from './denormalization.service';
import type { CompanyMergerService } from '../repositories/company-merger.service';
import type { ClickHouseRepository } from '../repositories/clickhouse.repository';
import type { ISyncStateStoragePort } from '../ports/i-sync-state-storage.port';
import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { ExternalEnrichmentService } from './external-enrichment.service';

export interface SyncOrchestratorDeps {
  identityMapping: IdentityMappingService;
  denormalization: DenormalizationService;
  merger: CompanyMergerService;
  repository: ClickHouseRepository;
  syncStateStorage: ISyncStateStoragePort;
  progressReporter: ProgressReporter;
  enrichment?: ExternalEnrichmentService;
}

export function createSyncOrchestrator(deps: SyncOrchestratorDeps): SyncOrchestrator {
  const {
    identityMapping,
    denormalization,
    merger,
    repository,
    syncStateStorage,
    progressReporter,
    enrichment
  } = deps;

  const reporterPort: IProgressReporterPort = new ProgressReporterAdapter(progressReporter);
  const identityMappingPort = new IdentityMappingAdapter(identityMapping);

  return new SyncOrchestrator(
    new IdentityMappingHandler(identityMappingPort, syncStateStorage, reporterPort),
    new DenormalizationHandler(denormalization, reporterPort),
    new EnrichmentHandler(enrichment!),
    new MergerHandler(merger, reporterPort),
    new CleanupHandler(repository)
  );
}
