/**
 * Zero-Downtime Refresh Summary — RENAME approach (downtime < 100мс)
 * Architecture: Domain → UseCase → Infrastructure
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IMigrationLock } from './infrastructure/ports/i-migration-lock.port';
/** Progress reporter callback (Port) */
export type RefreshProgressReporter = (stage: string, percentage: number, message: string) => Promise<void> | void;
/** Опции для refreshFinancialSummary */
export interface RefreshOptions {
    reportProgress?: RefreshProgressReporter;
    dryRun?: boolean;
    lock?: IMigrationLock;
    lockKey?: string;
    lockTimeoutMs?: number;
}
/** Результат выполнения refresh */
export interface RefreshResult {
    rows: number;
    elapsedMs: number;
}
/**
 * Атомарно обновляет financial_reports_summary без downtime
 * @example
 * await refreshFinancialSummary(client, { reportProgress: (s, p, m) => console.log(m) });
 */
export declare function refreshFinancialSummary(client: ClickHouseClient, options?: RefreshOptions): Promise<RefreshResult>;
