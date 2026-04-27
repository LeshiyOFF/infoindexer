/**
 * Merge Sanctions Stage
 *
 * Объединение санкций с данными компаний.
 */
import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { CircuitBreaker } from '../infrastructure/circuit-breaker';
import type { RetryPolicy } from '../infrastructure/retry';
import type { ISanctionRepository } from 'shared/repositories';
import { BaseSyncStage } from './sync-stage';
import type { StageContext, StageMetadata, StageResult, StageOptions } from './stage-context';
/**
 * Stage для объединения санкций с компаниями
 */
export declare class MergeSanctionsStage extends BaseSyncStage {
    private readonly sanctionsRepo;
    private readonly BATCH_SIZE;
    constructor(context: StageContext, sanctionsRepo: ISanctionRepository);
    /**
     * Выполняет объединение санкций с компаниями
     */
    protected runInternal(options: StageOptions): Promise<StageResult>;
    /**
     * Возвращает метаданные stage
     */
    protected getMetadata(): StageMetadata;
    /**
     * Обрабатывает ИНН батчами
     */
    private processInnBatches;
    /**
     * Обрабатывает батч ИНН
     */
    private processBatch;
}
/**
 * Фабрика для создания MergeSanctionsStage
 */
export declare function createMergeSanctionsStage(reporter: ProgressReporter, circuitBreaker: CircuitBreaker, retryPolicy: RetryPolicy, sanctionsRepo: ISanctionRepository): MergeSanctionsStage;
