import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { UnmappedInnsRepository } from '../repositories/unmapped-inns.repository';
import type { EnrichmentBatchProcessor } from './enrichment-batch-processor.service';
/**
 * Результат enrichment процесса
 */
export interface EnrichmentResult {
    processed: number;
    matched: number;
    failed: number;
}
/**
 * Сервис внешнего обогащения данных (External Enrichment)
 * Оркестрирует процесс обогащения через DaData API
 */
export declare class ExternalEnrichmentService {
    private readonly unmapped;
    private readonly processor;
    private readonly progress;
    constructor(unmapped: UnmappedInnsRepository, processor: EnrichmentBatchProcessor, progress: ProgressReporter);
    /**
     * Выполняет полное обогащение unmapped INN
     */
    enrichUnmappedInns(): Promise<EnrichmentResult>;
    /**
     * Обрабатывает INN батчами с rate limiting
     */
    private processInBatches;
    private sleep;
}
