import type { ClickHouseClient } from '@clickhouse/client';
import type { IConnections, IOrganizationById, IOrganizationSearch, IQueryExecutor, ISummaryChecker } from './ports';
/**
 * Factory для создания адаптеров ClickHouse
 *
 * @remarks
 * Централизует создание зависимостей.
 * Упрощает тестирование через подмену зависимостей.
 */
export declare class ClickHouseAdapterFactory {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Создаёт checker для summary таблицы
     */
    createSummaryChecker(): ISummaryChecker;
    /**
     * Создаёт executor для запросов
     */
    createQueryExecutor(): IQueryExecutor;
    /**
     * Создаёт сервис поиска связей
     */
    createConnections(): IConnections;
    /**
     * Создаёт порт для поиска организаций
     */
    createOrganizationSearch(): IOrganizationSearch;
    /**
     * Создаёт порт для получения организации по ID
     */
    createOrganizationById(): IOrganizationById;
}
