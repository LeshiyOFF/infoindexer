import type { ClickHouseClient } from '@clickhouse/client';
import type { ISanctionAggregation } from '../ports/i-sanction-aggregation.port';
/**
 * Adapter для агрегированных запросов по санкциям в ClickHouse
 *
 * @remarks
 * Реализует Port ISanctionAggregation для ClickHouse.
 */
export declare class AggregationHelper implements ISanctionAggregation {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Получает агрегацию по указанному полю
     *
     * @param field - Имя поля ('country' или 'program')
     * @returns Record с подсчётом
     */
    getByField(field: 'country' | 'program'): Promise<Record<string, number>>;
    /**
     * Получает агрегацию по странам
     */
    getByCountry(): Promise<Record<string, number>>;
    /**
     * Получает агрегацию по программам
     */
    getByProgram(): Promise<Record<string, number>>;
}
