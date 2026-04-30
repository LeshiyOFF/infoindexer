"use strict";
/**
 * Handler: Enrichment Stage
 *
 * @remarks
 * Выполняет обогащение данных из внешних источников (DaData).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentHandler = void 0;
class EnrichmentHandler {
    enrichment;
    stageName = 'enrichment';
    constructor(enrichment) {
        this.enrichment = enrichment;
    }
    async execute(context) {
        const { enableEnrichment = false } = context;
        if (enableEnrichment) {
            const enrichmentResult = await this.enrichment.enrichUnmappedInns();
            console.log(`Enrichment: ${enrichmentResult.matched}/${enrichmentResult.processed} matched`);
        }
    }
}
exports.EnrichmentHandler = EnrichmentHandler;
