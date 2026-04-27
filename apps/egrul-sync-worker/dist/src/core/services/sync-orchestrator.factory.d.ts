/**
 * Factory: Sync Orchestrator
 *
 * @remarks
 * Создаёт оркестратор с адаптерами для зависимостей.
 */
import { SyncOrchestrator } from './sync-orchestrator.service';
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
export declare function createSyncOrchestrator(deps: SyncOrchestratorDeps): SyncOrchestrator;
