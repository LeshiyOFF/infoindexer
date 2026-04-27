/**
 * ClickHouse Sanctions Query Service
 *
 * Выделенные query-методы для соблюдения лимита размера файла.
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type { SanctionRow } from 'shared/repositories';
import type { SanctionStats } from 'shared/repositories';

/**
 * Сервис для выполнения запросов к ClickHouse
 */
export class SanctionsQueryService {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Загружает агрегированную статистику
   */
  async fetchStatsRow(): Promise<{
    total: string;
    active: string;
  }> {
    const resultSet = await this.client.query({
      query: `
        SELECT
          count() AS total,
          countIf(end_date IS NULL OR end_date > today()) AS active
        FROM company_sanctions
      `,
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json<{ total: string; active: string }>();
    return rows[0];
  }

  /**
   * Загружает группировку по странам
   */
  async fetchGroupByCountry(): Promise<Record<string, number>> {
    const resultSet = await this.client.query({
      query: `
        SELECT country, count() AS cnt
        FROM company_sanctions
        GROUP BY country
        ORDER BY cnt DESC
      `,
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json<{ country: string; cnt: string }>();
    const result: Record<string, number> = {};
    for (const { country, cnt } of rows) {
      result[country] = parseInt(cnt, 10);
    }
    return result;
  }

  /**
   * Загружает группировку по программам
   */
  async fetchGroupByProgram(): Promise<Record<string, number>> {
    const resultSet = await this.client.query({
      query: `
        SELECT program, count() AS cnt
        FROM company_sanctions
        GROUP BY program
        ORDER BY cnt DESC
      `,
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json<{ program: string; cnt: string }>();
    const result: Record<string, number> = {};
    for (const { program, cnt } of rows) {
      result[program] = parseInt(cnt, 10);
    }
    return result;
  }

  /**
   * Загружает полную статистику
   */
  async fetchFullStats(): Promise<SanctionStats> {
    const [statsRow, byCountry, byProgram] = await Promise.all([
      this.fetchStatsRow(),
      this.fetchGroupByCountry(),
      this.fetchGroupByProgram()
    ]);

    return {
      total: parseInt(statsRow.total, 10),
      active: parseInt(statsRow.active, 10),
      byCountry,
      byProgram
    };
  }
}
