import type { ClickHouseClient } from '@clickhouse/client';
import type { CompanyMeta } from '../../../interfaces';
import type { QueryParams } from '../ports/i-query-executor.port';
import type { IQueryExecutor } from '../ports/i-query-executor.port';
import { ArrayUtil } from '../../../utils/array.util';

/**
 * Настройки ClickHouse для тяжёлых запросов
 */
const QUERY_SETTINGS = {
  max_memory_usage: '10000000000',
  join_algorithm: 'auto' as const,
  max_bytes_before_external_group_by: '4000000000',
  max_bytes_before_external_sort: '4000000000'
} as const;

/**
 * Adapter для выполнения запросов через ClickHouse
 *
 * @remarks
 * Реализует Port IQueryExecutor для ClickHouse.
 */
export class ClickHouseQueryExecutor implements IQueryExecutor {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Выполняет COUNT запрос
   */
  async executeCount(
    whereClause: string,
    queryParams: QueryParams
  ): Promise<number> {
    const result = await this.client.query({
      query: `SELECT count() as total FROM financial_reports_summary WHERE ${whereClause}`,
      query_params: queryParams,
      format: 'JSONEachRow',
      clickhouse_settings: QUERY_SETTINGS
    });

    const json = await result.json();
    const data = ArrayUtil.ensureArray(json);
    const row = ArrayUtil.first<{ readonly total?: string }>(data);
    const rawTotal = row?.total ?? '0';
    return parseInt(rawTotal, 10);
  }

  /**
   * Выполняет основной SELECT запрос
   */
  async executeSelect(
    whereClause: string,
    sortBy: string,
    sortOrder: string,
    queryParams: QueryParams,
    hasOkvedColumn: boolean
  ): Promise<CompanyMeta[]> {
    const selectCols = hasOkvedColumn
      ? 'inn, name, ogrn, region, latest_year, records_count, lon, lat, status, director, revenue, net_profit, charter_capital, age, okved'
      : 'inn, name, ogrn, region, latest_year, records_count, lon, lat, status, director, revenue, net_profit, charter_capital, age';

    const result = await this.client.query({
      query: `
        SELECT ${selectCols}
        FROM financial_reports_summary
        WHERE ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT {limit: Int32} OFFSET {offset: Int32}
      `,
      query_params: queryParams,
      format: 'JSONEachRow',
      clickhouse_settings: QUERY_SETTINGS
    });

    const json = await result.json();
    return ArrayUtil.ensureArray(json) as CompanyMeta[];
  }
}
