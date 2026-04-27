/**
 * ClickHouse Sanctions Repository
 *
 * Реализация Port ISanctionRepository для ClickHouse.
 * Adapter в терминологии Hexagonal Architecture.
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type { SanctionRow, SanctionStats } from 'shared/repositories';
import type { ISanctionRepository } from 'shared/repositories';
import type { SanctionDTO } from 'shared/domain/entities';
import { sanctionMapper } from './clickhouse-sanctions.mapper';
import { SanctionsQueryService } from './clickhouse-sanctions-queries.service';

/**
 * ClickHouse реализация репозитория санкций
 */
export class ClickHouseSanctionsRepository implements ISanctionRepository {
  private readonly queries: SanctionsQueryService;

  constructor(
    private readonly client: ClickHouseClient
  ) {
    this.queries = new SanctionsQueryService(client);
  }

  /**
   * Сохраняет батч санкций
   */
  async saveBatch(rows: readonly SanctionRow[]): Promise<void> {
    if (rows.length === 0) return;

    await this.client.insert({
      table: 'company_sanctions',
      values: rows,
      format: 'JSONEachRow'
    });
  }

  /**
   * Находит санкции по ИНН
   */
  async findByInn(inn: string): Promise<readonly SanctionDTO[]> {
    const resultSet = await this.client.query({
      query: `
        SELECT *
        FROM company_sanctions
        WHERE inn = {inn: String}
        ORDER BY start_date DESC
      `,
      query_params: { inn },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json<SanctionRow>();
    return sanctionMapper.rowsToDTO(rows);
  }

  /**
   * Находит санкции по списку ИНН
   */
  async findByInns(inns: readonly string[]): Promise<Readonly<Record<string, readonly SanctionDTO[]>>> {
    if (inns.length === 0) return {};

    const resultSet = await this.client.query({
      query: `
        SELECT *
        FROM company_sanctions
        WHERE inn IN {inns: Array(String)}
        ORDER BY inn, start_date DESC
      `,
      query_params: { inns },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json<SanctionRow>();

    // Группируем по ИНН
    const result: Record<string, SanctionDTO[]> = {};
    for (const row of rows) {
      if (!result[row.inn]) {
        result[row.inn] = [];
      }
      result[row.inn].push(sanctionMapper.rowToDTO(row));
    }

    return result;
  }

  /**
   * Удаляет все санкции для ИНН
   */
  async deleteByInn(inn: string): Promise<void> {
    await this.client.command({
      query: `
        ALTER TABLE company_sanctions
        DELETE WHERE inn = {inn: String}
      `,
      query_params: { inn }
    });
  }

  /**
   * Получает статистику по санкциям
   */
  async getStats(): Promise<SanctionStats> {
    return this.queries.fetchFullStats();
  }

  /**
   * Проверяет существование санкций для ИНН
   */
  async exists(inn: string): Promise<boolean> {
    const resultSet = await this.client.query({
      query: `
        SELECT count() AS cnt
        FROM company_sanctions
        WHERE inn = {inn: String}
        LIMIT 1
      `,
      query_params: { inn },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json<{ cnt: string }>();
    return parseInt(rows[0].cnt, 10) > 0;
  }

  /**
   * Получает все уникальные ИНН с санкциями
   */
  async getAllInns(limit: number = 10000): Promise<readonly string[]> {
    const resultSet = await this.client.query({
      query: `
        SELECT DISTINCT inn
        FROM company_sanctions
        ORDER BY inn
        LIMIT {limit: UInt32}
      `,
      query_params: { limit },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json<{ inn: string }>();
    return rows.map(r => r.inn);
  }

  /**
   * Удаляет все санкции
   *
   * @remarks
   * Используется при abort для очистки частично загруженных данных.
   * TRUNCATE более эффективен чем DELETE для полной очистки.
   */
  async deleteAll(): Promise<void> {
    await this.client.command({
      query: `TRUNCATE TABLE company_sanctions`
    });
  }
}
