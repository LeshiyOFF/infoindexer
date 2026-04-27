/**
 * Handler: Enrichment Stage
 *
 * @remarks
 * Выполняет обогащение данных из внешних источников (DaData).
 */
import type { ISyncStageHandler, SyncStageContext } from '../../ports/sync-stage-handler.interface';
import type { ExternalEnrichmentService } from '../../services/external-enrichment.service';
export declare class EnrichmentHandler implements ISyncStageHandler {
    private readonly enrichment;
    readonly stageName = "enrichment";
    constructor(enrichment: ExternalEnrichmentService);
    execute(context: SyncStageContext): Promise<void>;
}
