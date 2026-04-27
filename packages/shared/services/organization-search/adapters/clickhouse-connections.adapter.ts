import type { ClickHouseClient } from '@clickhouse/client';
import type { CompanyMeta } from '../../../interfaces';
import type { ConnectionQueryParams } from '../ports/i-connections.port';
import type { IConnections } from '../ports/i-connections.port';
import { ArrayUtil } from '../../../utils/array.util';

/**
 * Adapter для поиска связанных организаций через ClickHouse
 *
 * @remarks
 * Реализует Port IConnections для ClickHouse.
 */
export class ClickHouseConnections implements IConnections {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Находит организации, связанные через директора или учредителей
   */
  async findByDirectorOrFounders(params: ConnectionQueryParams): Promise<Partial<CompanyMeta>[]> {
    const { director, founders, inn } = params;

    if (!director && founders.length === 0) {
      return [];
    }

    const query = this.buildQuery(founders.length > 0);
    const queryParams = this.buildParams(director, founders, inn);

    try {
      const result = await this.client.query({
        query,
        query_params: queryParams,
        format: 'JSONEachRow'
      });

      const json = await result.json();
      return ArrayUtil.ensureArray(json) as Partial<CompanyMeta>[];
    } catch (error) {
      console.error('ClickHouseConnections error:', error);
      return [];
    }
  }

  /**
   * Строит SQL запрос для поиска связей
   */
  private buildQuery(hasFounders: boolean): string {
    const baseQuery = `
      SELECT cm.inn, any(cm.name) AS name, any(cm.director) AS director, any(cm.status) AS status
      FROM companies_meta cm
      INNER JOIN (SELECT DISTINCT inn FROM financial_reports WHERE inn != '') fr ON cm.inn = fr.inn
      WHERE ((cm.director != '' AND cm.director = {director: String})
    `;

    const foundersCondition = hasFounders
      ? ` OR hasAny(cm.founders, {founders: Array(String)})`
      : '';

    return baseQuery + foundersCondition + `) AND cm.inn != {id: String} GROUP BY cm.inn LIMIT 10`;
  }

  /**
   * Строит параметры запроса
   */
  private buildParams(
    director: string,
    founders: readonly string[],
    inn: string
  ): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {
      director,
      id: inn
    };

    if (founders.length > 0) {
      params.founders = [...founders];
    }

    return params;
  }
}
