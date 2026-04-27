import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { ExternalEnrichmentService } from '../services/external-enrichment.service';
/**
 * Worker для фонового обогащения данных
 * Работает независимо от основного процесса синхронизации
 */
export declare class EnrichmentWorker {
    private readonly enrichment;
    private readonly progress;
    private readonly redisChannel;
    private isRunning;
    constructor(enrichment: ExternalEnrichmentService, progress: ProgressReporter, redisChannel?: string);
    /**
     * Запускает worker
     */
    start(): void;
    /**
     * Останавливает worker
     */
    stop(): void;
    /**
     * Подписывается на Redis канал
     */
    private subscribe;
    /**
     * Выполняет enrichment
     */
    private execute;
}
/**
 * Фабрика для создания EnrichmentWorker
 */
export declare class EnrichmentWorkerFactory {
    private static instance;
    static create(enrichment: ExternalEnrichmentService, progress: ProgressReporter): EnrichmentWorker;
    static getInstance(): EnrichmentWorker | null;
}
