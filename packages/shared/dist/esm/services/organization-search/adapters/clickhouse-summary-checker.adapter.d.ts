import type { ClickHouseClient } from '@clickhouse/client';
import type { ISummaryChecker, SummaryCheckResult } from '../ports/i-summary-checker.port';
/**
 * Adapter для проверки готовности таблицы через ClickHouse
 */
export declare class ClickHouseSummaryChecker implements ISummaryChecker {
    private readonly client;
    constructor(client: ClickHouseClient);
    check(): Promise<SummaryCheckResult>;
}
