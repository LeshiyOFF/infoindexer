import type { DaDataAdapter } from '../adapters/dadata-adapter';
import type { FuzzyMatcherService } from './fuzzy-matcher.service';
import type { PersonLookupRepository } from '../repositories/person-lookup.repository';
import type { EnrichmentMappingRepository } from '../repositories/enrichment-mapping.repository';
/**
 * Результат обработки батча
 */
export interface BatchEnrichmentResult {
    processed: number;
    matched: number;
    failed: number;
}
/**
 * Сервис для батч-обработки enrichment
 */
export declare class EnrichmentBatchProcessor {
    private readonly dadata;
    private readonly fuzzy;
    private readonly persons;
    private readonly mappings;
    constructor(dadata: DaDataAdapter, fuzzy: FuzzyMatcherService, persons: PersonLookupRepository, mappings: EnrichmentMappingRepository);
    /**
     * Обрабатывает батч INN
     */
    processBatch(inns: string[]): Promise<BatchEnrichmentResult>;
    /**
     * Обогащает один INN через DaData + fuzzy matching
     */
    private enrichSingleInn;
}
