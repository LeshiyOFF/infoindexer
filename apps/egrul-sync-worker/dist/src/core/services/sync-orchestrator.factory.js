"use strict";
/**
 * Factory: Sync Orchestrator
 *
 * @remarks
 * Создаёт оркестратор с адаптерами для зависимостей.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSyncOrchestrator = createSyncOrchestrator;
const sync_orchestrator_service_1 = require("./sync-orchestrator.service");
const sync_handlers_1 = require("./sync-handlers");
const progress_reporter_adapter_1 = require("../infrastructure/adapters/progress-reporter.adapter");
const identity_mapping_adapter_1 = require("../infrastructure/adapters/identity-mapping.adapter");
function createSyncOrchestrator(deps) {
    const { identityMapping, denormalization, repository, syncStateStorage, progressReporter, enrichment } = deps;
    const reporterPort = new progress_reporter_adapter_1.ProgressReporterAdapter(progressReporter);
    const identityMappingPort = new identity_mapping_adapter_1.IdentityMappingAdapter(identityMapping);
    return new sync_orchestrator_service_1.SyncOrchestrator(new sync_handlers_1.IdentityMappingHandler(identityMappingPort, syncStateStorage, reporterPort), new sync_handlers_1.DenormalizationHandler(denormalization, reporterPort), new sync_handlers_1.EnrichmentHandler(enrichment), new sync_handlers_1.MergerHandler(reporterPort), new sync_handlers_1.CleanupHandler(repository));
}
