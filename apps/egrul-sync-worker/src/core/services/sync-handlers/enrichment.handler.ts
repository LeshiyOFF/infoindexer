/**
 * Handler: Enrichment Stage
 *
 * @remarks
 * Выполняет обогащение данных из внешних источников (DaData).
 */

import type { ISyncStageHandler, SyncStageContext } from '../../ports/sync-stage-handler.interface';
import type { ExternalEnrichmentService } from '../../services/external-enrichment.service';

export class EnrichmentHandler implements ISyncStageHandler {
  readonly stageName = 'enrichment';

  constructor(private readonly enrichment: ExternalEnrichmentService) {}

  async execute(context: SyncStageContext): Promise<void> {
    const { enableEnrichment = false } = context;

    if (enableEnrichment) {
      const enrichmentResult = await this.enrichment.enrichUnmappedInns();
      console.log(
        `Enrichment: ${enrichmentResult.matched}/${enrichmentResult.processed} matched`
      );
    }
  }
}
