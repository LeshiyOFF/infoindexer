import type { IQueryMetricsCollector } from '../ports/i-query-metrics-collector.port';
import type { ICircuitBreakerPort } from '../circuit-breaker/ports/i-circuit-breaker.port';
interface SyncStats {
    innsProcessed: number;
    durationMs: number;
    error?: string;
}
export declare class CompaniesMetaSyncWorker {
    private readonly metrics;
    private running;
    private timer?;
    private readonly breaker;
    constructor(metrics: IQueryMetricsCollector, breaker?: ICircuitBreakerPort);
    /**
     * Запустить периодическую синхронизацию
     */
    start(): void;
    /**
     * Остановить периодическую синхронизацию
     */
    stop(): void;
    /**
     * Выполнить один цикл синхронизации
     */
    syncOnce(): Promise<SyncStats>;
    private scheduleNext;
    private getSyncState;
    private getPendingInns;
    private syncInns;
    private updateSyncState;
}
export {};
