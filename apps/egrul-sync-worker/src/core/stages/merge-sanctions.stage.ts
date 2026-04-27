/**
 * Merge Sanctions Stage
 *
 * Объединение санкций с данными компаний.
 */

import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { CircuitBreaker } from '../infrastructure/circuit-breaker';
import type { RetryPolicy } from '../infrastructure/retry';
import { SyncStage } from 'shared';
import type { ISanctionRepository } from 'shared/repositories';
import { BaseSyncStage } from './sync-stage';
import type { StageContext, StageMetadata, StageResult, StageOptions } from './stage-context';
import { stageSuccess, stageFailure } from './stage-context';

/**
 * Статистика объединения
 */
interface MergeStats {
  processed: number;
  sanctionsAdded: number;
  errors: number;
}

/**
 * Stage для объединения санкций с компаниями
 */
export class MergeSanctionsStage extends BaseSyncStage {
  private readonly BATCH_SIZE = 500;

  constructor(
    context: StageContext,
    private readonly sanctionsRepo: ISanctionRepository
  ) {
    super(context);
  }

  /**
   * Выполняет объединение санкций с компаниями
   */
  protected async runInternal(options: StageOptions): Promise<StageResult> {
    try {
      const sanctionedInns = await this.sanctionsRepo.getAllInns(100000);

      if (sanctionedInns.length === 0) {
        return stageSuccess(0, 'Нет санкций для объединения');
      }

      const stats = await this.processInnBatches(sanctionedInns, options.onProgress);

      return stageSuccess(
        stats.processed,
        `Обработано ${stats.processed} компаний, добавлено ${stats.sanctionsAdded} санкций${stats.errors > 0 ? `, ${stats.errors} ошибок` : ''}`
      );

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return stageFailure(message, 'MERGE_SANCTIONS_FAILED');
    }
  }

  /**
   * Возвращает метаданные stage
   */
  protected getMetadata(): StageMetadata {
    return {
      name: 'Объединение санкций',
      stage: SyncStage.MERGE_SANCTIONS,
      startPercentage: 70,
      endPercentage: 85
    };
  }

  /**
   * Обрабатывает ИНН батчами
   */
  private async processInnBatches(
    inns: readonly string[],
    onProgress?: (progress: number, message: string) => void
  ): Promise<MergeStats> {
    const stats: MergeStats = {
      processed: 0,
      sanctionsAdded: 0,
      errors: 0
    };

    const totalBatches = Math.ceil(inns.length / this.BATCH_SIZE);
    let batchNumber = 0;

    for (let i = 0; i < inns.length; i += this.BATCH_SIZE) {
      const batch = inns.slice(i, i + this.BATCH_SIZE);
      batchNumber++;

      const batchResult = await this.processBatch(batch);

      stats.processed += batchResult.processed;
      stats.sanctionsAdded += batchResult.sanctionsAdded;
      stats.errors += batchResult.errors;

      const progress = (batchNumber / totalBatches) * 100;
      onProgress?.(progress, `Обработано ${stats.processed}/${inns.length} компаний`);
    }

    return stats;
  }

  /**
   * Обрабатывает батч ИНН
   */
  private async processBatch(inns: readonly string[]): Promise<{
    processed: number;
    sanctionsAdded: number;
    errors: number;
  }> {
    let processed = 0;
    let sanctionsAdded = 0;
    let errors = 0;

    for (const inn of inns) {
      try {
        const hasSanctions = await this.sanctionsRepo.exists(inn);
        if (!hasSanctions) {
          continue;
        }

        const sanctions = await this.sanctionsRepo.findByInn(inn);
        processed++;
        sanctionsAdded += sanctions.length;

      } catch {
        errors++;
      }
    }

    return { processed, sanctionsAdded, errors };
  }
}

/**
 * Фабрика для создания MergeSanctionsStage
 */
export function createMergeSanctionsStage(
  reporter: ProgressReporter,
  circuitBreaker: CircuitBreaker,
  retryPolicy: RetryPolicy,
  sanctionsRepo: ISanctionRepository
): MergeSanctionsStage {
  const context: StageContext = {
    reporter,
    circuitBreaker,
    retryPolicy,
    startTime: new Date()
  };

  return new MergeSanctionsStage(context, sanctionsRepo);
}
