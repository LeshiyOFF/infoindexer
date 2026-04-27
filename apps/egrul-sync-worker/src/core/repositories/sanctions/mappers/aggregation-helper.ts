import type { ClickHouseClient } from '@clickhouse/client';
import type { ClickHouseAggregationRow } from './sanctions-mappers';
import { buildCountMap } from './sanctions-mappers';
import { TypeGuardUtil } from '../../../utils/type-guards.util';
import type { ISanctionAggregation } from '../ports/i-sanction-aggregation.port';

/**
 * Adapter для агрегированных запросов по санкциям в ClickHouse
 *
 * @remarks
 * Реализует Port ISanctionAggregation для ClickHouse.
 */
export class AggregationHelper implements ISanctionAggregation {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Получает агрегацию по указанному полю
   *
   * @param field - Имя поля ('country' или 'program')
   * @returns Record с подсчётом
   */
  async getByField(field: 'country' | 'program'): Promise<Record<string, number>> {
    const result = await this.client.query({
      query: `
        SELECT ${field}, count() as cnt
        FROM company_sanctions
        GROUP BY ${field}
        ORDER BY cnt DESC
      `
    });

    const json = await result.json();
    const rows = TypeGuardUtil.ensureArray(json) as ClickHouseAggregationRow[];
    return buildCountMap(rows, field);
  }

  /**
   * Получает агрегацию по странам
   */
  async getByCountry(): Promise<Record<string, number>> {
    return this.getByField('country');
  }

  /**
   * Получает агрегацию по программам
   */
  async getByProgram(): Promise<Record<string, number>> {
    return this.getByField('program');
  }
}
