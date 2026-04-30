/**
 * Transform Polling Worker
 *
 * @remarks
 * Background worker for periodic staging → production transformation.
 * Follows SRP: only responsible for polling and triggering.
 * Follows DIP: depends on ports (ITransformService, ILogger, IMetricsCollectorPort).
 *
 * @pattern Single Responsibility Principle
 * @pattern Worker Pattern
 * @pattern Hexagonal / Ports & Adapters
 */
import type { ITransformService } from '../domain/ports/i-transform-service.port';
import type { IWorker, WorkerState } from '../domain/ports/i-worker.port';
import type { WorkerConfig } from '../domain/value-objects/worker-config.vo';
import type { IMetricsCollectorPort } from '../ports/i-metrics-collector.port';
import type { ILogger } from '../domain/ports/i-logger.port';
/**
 * Transform Polling Worker
 *
 * @remarks
 * Periodically checks staging tables and triggers transform when needed.
 * Implements graceful shutdown and parallel execution protection.
 */
export declare class TransformPollingWorker implements IWorker {
    private readonly transformService;
    private readonly config;
    private readonly metrics;
    readonly name = "TransformPollingWorker";
    private state;
    private timer;
    private currentTransform;
    private readonly logger;
    constructor(transformService: ITransformService, config: WorkerConfig, metrics: IMetricsCollectorPort | undefined, baseLogger: ILogger);
    start(): Promise<void>;
    stop(timeoutMs?: number): Promise<void>;
    getState(): WorkerState;
    isRunning(): boolean;
    private initialState;
    private executeCycle;
    private runTransform;
    private transformTable;
    private timeout;
}
