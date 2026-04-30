/**
 * Sanctions Sync Stage
 *
 * Загрузка и парсинг санкций из OpenSanctions API.
 */
import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { CircuitBreaker } from '../infrastructure/circuit-breaker';
import type { RetryPolicy } from '../infrastructure/retry';
import type { ISanctionRepository } from 'shared/repositories';
import type { SanctionParserService } from '../parsers/sanction-parser.service';
import type { FTMHttpClient } from '../infrastructure/http-client';
import { BaseSyncStage } from './sync-stage';
import type { StageContext, StageMetadata, StageOptions, StageResult } from './stage-context';
/**
 * Конфигурация sanctions sync
 */
interface SanctionsSyncConfig {
    readonly apiUrl: string;
    readonly batchSize: number;
    readonly timeout: number;
    readonly abortSignal?: AbortSignal;
}
/**
 * Stage для загрузки санкций
 */
export declare class SanctionsSyncStage extends BaseSyncStage {
    private readonly repository;
    private readonly parser;
    private readonly httpClient;
    private readonly config;
    constructor(context: StageContext, repository: ISanctionRepository, parser: SanctionParserService, httpClient: FTMHttpClient, sanctionsConfig?: Partial<SanctionsSyncConfig>);
    /**
     * Выполняет загрузку и парсинг санкций
     */
    protected runInternal(options: StageOptions): Promise<StageResult>;
    /**
     * Возвращает метаданные stage
     */
    protected getMetadata(): StageMetadata;
    /**
     * Загружает страницу санкций из API
     */
    private fetchSanctionsPage;
    /**
     * Обрабатывает батч санкций
     */
    private processBatch;
}
/**
 * Фабрика для создания SanctionsSyncStage
 */
export declare function createSanctionsSyncStage(reporter: ProgressReporter, circuitBreaker: CircuitBreaker, retryPolicy: RetryPolicy, repository: ISanctionRepository, parser: SanctionParserService, httpClient: FTMHttpClient, sanctionsConfig?: Partial<SanctionsSyncConfig>): SanctionsSyncStage;
export {};
