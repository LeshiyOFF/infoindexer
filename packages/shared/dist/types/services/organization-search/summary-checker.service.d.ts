import type { ClickHouseClient } from '@clickhouse/client';
/**
 * Результат проверки summary таблицы
 */
export interface SummaryCheckResult {
    ready: boolean;
    hasOkvedColumn: boolean;
}
/**
 * Сервис для проверки готовности таблицы financial_reports_summary
 */
export declare class SummaryCheckerService {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Проверяет готовность таблицы financial_reports_summary
     */
    check(): Promise<SummaryCheckResult>;
    /**
     * Гарантирует, что результат является массивом
     */
    private ensureArray;
}
