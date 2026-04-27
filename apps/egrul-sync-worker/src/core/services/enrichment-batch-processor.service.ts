import type { DaDataAdapter } from '../adapters/dadata-adapter';
import type { FuzzyMatcherService } from './fuzzy-matcher.service';
import type { PersonLookupRepository } from '../repositories/person-lookup.repository';
import type { EnrichmentMappingRepository } from '../repositories/enrichment-mapping.repository';
import { ENRICHMENT_MAX_DISTANCE, ENRICHMENT_MIN_CONFIDENCE } from '../../config/constants';

/**
 * Результат обработки одного INN
 */
interface InnEnrichmentResult {
  inn: string;
  matched: boolean;
}

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
export class EnrichmentBatchProcessor {
  constructor(
    private readonly dadata: DaDataAdapter,
    private readonly fuzzy: FuzzyMatcherService,
    private readonly persons: PersonLookupRepository,
    private readonly mappings: EnrichmentMappingRepository
  ) {}

  /**
   * Обрабатывает батч INN
   */
  async processBatch(inns: string[]): Promise<BatchEnrichmentResult> {
    const results: InnEnrichmentResult[] = [];

    for (const inn of inns) {
      try {
        const matched = await this.enrichSingleInn(inn);
        results.push({ inn, matched });
      } catch {
        results.push({ inn, matched: false });
      }
    }

    const matched = results.filter((r) => r.matched).length;
    const failed = results.filter((r) => !r.matched).length;

    return { processed: inns.length, matched, failed };
  }

  /**
   * Обогащает один INN через DaData + fuzzy matching
   */
  private async enrichSingleInn(inn: string): Promise<boolean> {
    const dadataResult = await this.dadata.lookupPersonByInn(inn);

    if (!dadataResult || !dadataResult.fio) {
      return false;
    }

    const persons = await this.persons.fetchAllPersons();
    const match = this.fuzzy.findBestMatch(
      dadataResult.fio,
      persons,
      ENRICHMENT_MAX_DISTANCE
    );

    if (!match || match.confidence < ENRICHMENT_MIN_CONFIDENCE) {
      return false;
    }

    await this.mappings.insertMapping(inn, match.id, match.confidence);

    return true;
  }
}
