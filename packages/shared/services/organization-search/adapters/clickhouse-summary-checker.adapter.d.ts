import type { ClickHouseClient } from '@clickhouse/client';
import type { SummaryCheckResult } from '../ports/i-summary-checker.port';
import type { ISummaryChecker } from '../ports/i-summary-checker.port';
/**
 * Adapter для проверки готовности таблицы через ClickHouse
 *
 * @remarks
 * Реализует Port ISummaryChecker для ClickHouse.
 */
export declare class ClickHouseSummaryChecker implements ISummaryChecker {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Проверяет готовность таблицы financial_reports_summary
     */
    check(): Promise<SummaryCheckResult>;
}
