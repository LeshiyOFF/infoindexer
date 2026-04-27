"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalEnrichmentService = void 0;
const constants_1 = require("../../config/constants");
/**
 * Сервис внешнего обогащения данных (External Enrichment)
 * Оркестрирует процесс обогащения через DaData API
 */
class ExternalEnrichmentService {
    unmapped;
    processor;
    progress;
    constructor(unmapped, processor, progress) {
        this.unmapped = unmapped;
        this.processor = processor;
        this.progress = progress;
    }
    /**
     * Выполняет полное обогащение unmapped INN
     */
    async enrichUnmappedInns() {
        console.log('Starting external enrichment for unmapped INNs...');
        await this.progress.report(this.progress.createState('running', 60, 'Внешнее обогащение данных...'));
        const unmappedInns = await this.unmapped.fetchUnmappedInns(constants_1.ENRICHMENT_BATCH_SIZE);
        if (unmappedInns.length === 0) {
            console.log('No unmapped INNs found for enrichment.');
            return { processed: 0, matched: 0, failed: 0 };
        }
        console.log(`Found ${unmappedInns.length} unmapped INNs for enrichment`);
        const result = await this.processInBatches(unmappedInns);
        console.log(`Enrichment completed: ${result.matched} matched from ${result.processed} processed`);
        await this.progress.report(this.progress.createState('running', 95, 'Обогащение завершено'));
        return result;
    }
    /**
     * Обрабатывает INN батчами с rate limiting
     */
    async processInBatches(inns) {
        let processed = 0;
        let matched = 0;
        let failed = 0;
        for (let i = 0; i < inns.length; i += constants_1.ENRICHMENT_BATCH_SIZE) {
            const batch = inns.slice(i, i + constants_1.ENRICHMENT_BATCH_SIZE);
            const batchResult = await this.processor.processBatch(batch);
            processed += batchResult.processed;
            matched += batchResult.matched;
            failed += batchResult.failed;
            const progress = 60 + Math.floor((i + batch.length) / inns.length * 35);
            await this.progress.report(this.progress.createState('running', progress, `Обогащение: ${processed}/${inns.length}`));
            if (i + constants_1.ENRICHMENT_BATCH_SIZE < inns.length) {
                await this.sleep(constants_1.ENRICHMENT_RATE_LIMIT_DELAY);
            }
        }
        return { processed, matched, failed };
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.ExternalEnrichmentService = ExternalEnrichmentService;
