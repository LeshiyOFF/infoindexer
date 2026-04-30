import type { ClickHouseClient } from '@clickhouse/client';
/**
 * Сущность Person для поиска
 */
export interface PersonLookup {
    id: string;
    name: string;
}
/**
 * Репозиторий для поиска Person entities
 */
export declare class PersonLookupRepository {
    private readonly clickhouse;
    constructor(clickhouse: ClickHouseClient);
    /**
     * Получает все Person из raw таблицы для fuzzy matching
     */
    fetchAllPersons(): Promise<PersonLookup[]>;
}
