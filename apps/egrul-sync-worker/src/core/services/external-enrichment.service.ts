import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { UnmappedInnsRepository } from '../repositories/unmapped-inns.repository';
import type { EnrichmentBatchProcessor } from './enrichment-batch-processor.service';
import {
  ENRICHMENT_BATCH_SIZE,
  ENRICHMENT_RATE_LIMIT_DELAY
} from '../../config/constants';

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
export class ExternalEnrichmentService {
  constructor(
    private readonly unmapped: UnmappedInnsRepository,
    private readonly processor: EnrichmentBatchProcessor,
    private readonly progress: ProgressReporter
  ) {}

  /**
   * Выполняет полное обогащение unmapped INN
   */
  async enrichUnmappedInns(): Promise<EnrichmentResult> {
    console.log('Starting external enrichment for unmapped INNs...');

    await this.progress.report(
      this.progress.createState('running', 60, 'Внешнее обогащение данных...')
    );

    const unmappedInns = await this.unmapped.fetchUnmappedInns(ENRICHMENT_BATCH_SIZE);

    if (unmappedInns.length === 0) {
      console.log('No unmapped INNs found for enrichment.');
      return { processed: 0, matched: 0, failed: 0 };
    }

    console.log(`Found ${unmappedInns.length} unmapped INNs for enrichment`);

    const result = await this.processInBatches(unmappedInns);

    console.log(`Enrichment completed: ${result.matched} matched from ${result.processed} processed`);

    await this.progress.report(
      this.progress.createState('running', 95, 'Обогащение завершено')
    );

    return result;
  }

  /**
   * Обрабатывает INN батчами с rate limiting
   */
  private async processInBatches(inns: string[]): Promise<EnrichmentResult> {
    let processed = 0;
    let matched = 0;
    let failed = 0;

    for (let i = 0; i < inns.length; i += ENRICHMENT_BATCH_SIZE) {
      const batch = inns.slice(i, i + ENRICHMENT_BATCH_SIZE);
      const batchResult = await this.processor.processBatch(batch);

      processed += batchResult.processed;
      matched += batchResult.matched;
      failed += batchResult.failed;

      const progress = 60 + Math.floor((i + batch.length) / inns.length * 35);
      await this.progress.report(
        this.progress.createState('running', progress, `Обогащение: ${processed}/${inns.length}`)
      );

      if (i + ENRICHMENT_BATCH_SIZE < inns.length) {
        await this.sleep(ENRICHMENT_RATE_LIMIT_DELAY);
      }
    }

    return { processed, matched, failed };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
