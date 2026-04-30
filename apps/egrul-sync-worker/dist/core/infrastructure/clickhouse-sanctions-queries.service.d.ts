/**
 * ClickHouse Sanctions Query Service
 *
 * Выделенные query-методы для соблюдения лимита размера файла.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { SanctionStats } from 'shared/repositories';
/**
 * Сервис для выполнения запросов к ClickHouse
 */
export declare class SanctionsQueryService {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Загружает агрегированную статистику
     */
    fetchStatsRow(): Promise<{
        total: string;
        active: string;
    }>;
    /**
     * Загружает группировку по странам
     */
    fetchGroupByCountry(): Promise<Record<string, number>>;
    /**
     * Загружает группировку по программам
     */
    fetchGroupByProgram(): Promise<Record<string, number>>;
    /**
     * Загружает полную статистику
     */
    fetchFullStats(): Promise<SanctionStats>;
}
