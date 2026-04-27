/**
 * Адаптер для хранения данных в ClickHouse
 *
 * @remarks
 * Реализует IClickHouseStorage порт с помощью ClickHouse клиента.
 * Использует ReplacingMergeTree для автоматической дедупликации.
 *
 * ВАЖНО: Таблица financial_reports создаётся через миграцию
 * 001_financial_reports_replacingmerge.sql. Метод ensureTable()
 * только проверяет существование и корректность Engine.
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type { IClickHouseStorage } from '../../ports';
import type { ColumnDefinition, FinancialReportRow } from '../../types';

/**
 * Адаптер для хранения данных в ClickHouse
 */
export class ClickHouseStorageAdapter implements IClickHouseStorage {
  private readonly tableName = 'financial_reports';
  private readonly expectedEngine = 'ReplacingMergeTree';

  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Проверяет что таблица существует с корректной схемой
   *
   * @remarks
   * Таблица создаётся через миграцию. Этот метод только проверяет
   * существование и корректность Engine. Если таблица не существует
   * или имеет неверный Engine — выбрасывает ошибку.
   *
   * @throws Error если таблица не существует или Engine неверный
   */
  async ensureTable(columns: readonly ColumnDefinition[]): Promise<void> {
    const exists = await this.tableExists();

    if (!exists) {
      throw new Error(
        `Table ${this.tableName} does not exist. ` +
        `Run migration first: 001_financial_reports_replacingmerge.sql`
      );
    }

    await this.validateEngine();
  }

  /**
   * Вставляет батч строк с updated_at
   *
   * @remarks
   * Добавляет updated_at для каждой строки.
   * ReplacingMergeTree использует это поле для выбора последней версии при дедупликации.
   *
   * @note updated_at добавляется здесь, а не в CREATE TABLE,
   * чтобы поддерживать гибкость при вставке данных.
   * ClickHouse client сам сериализует объекты в JSONEachRow формат.
   */
  async insertBatch(rows: readonly FinancialReportRow[]): Promise<void> {
    const now = this.getCurrentTimestamp();

    // Добавляем timestamp к каждой строке (shallow copy)
    const rowsWithTimestamp = rows.map(row => ({
      ...row,
      updated_at: now
    }));

    // Передаём массив объектов — клиент сам сериализует в JSONEachRow
    await this.client.insert({
      table: this.tableName,
      values: rowsWithTimestamp,
      format: 'JSONEachRow'
    });
  }

  /**
   * Подсчитывает количество уникальных строк для указанного года
   *
   * @remarks
   * Использует FINAL для получения дедуплицированных данных.
   * ReplacingMergeTree удаляет дубликаты только при FINAL или OPTIMIZE.
   */
  async countRows(year: number): Promise<number> {
    const result = await this.client.query({
      query: 'SELECT count() FINAL as cnt FROM financial_reports WHERE year = {year:UInt16}',
      query_params: { year },
      format: 'JSONEachRow'
    });

    const rows = await result.json() as Array<{ cnt: string }>;
    return parseInt(rows[0]?.cnt || '0', 10);
  }

  /**
   * Удаляет все строки за указанный год
   *
   * @remarks
   * Использует lightweight mutation ALTER TABLE DELETE.
   * Операция асинхронная, но блокирует чтение удалённых данных.
   */
  async deleteByYear(year: number): Promise<void> {
    await this.client.command({
      query: `ALTER TABLE ${this.tableName} DELETE WHERE year = {year:UInt16}`,
      query_params: { year }
    });
  }

  /**
   * Проверяет что таблица существует
   */
  private async tableExists(): Promise<boolean> {
    try {
      const result = await this.client.query({
        query: `
          SELECT count() as cnt
          FROM system.tables
          WHERE database = currentDatabase()
          AND name = {name:String}
        `,
        query_params: { name: this.tableName },
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ cnt: string }>;
      const count = parseInt(rows[0]?.cnt || '0', 10);
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Валидирует что таблица использует корректный Engine
   *
   * @throws Error если Engine не ReplacingMergeTree
   */
  private async validateEngine(): Promise<void> {
    const result = await this.client.query({
      query: `
        SELECT engine
        FROM system.tables
        WHERE database = currentDatabase()
        AND name = {name:String}
      `,
      query_params: { name: this.tableName },
      format: 'JSONEachRow'
    });

    const rows = await result.json() as Array<{ engine: string }>;

    if (rows.length === 0) {
      return; // Таблица не существует, tableExists() уже обработает
    }

    const actualEngine = rows[0]?.engine;

    if (actualEngine !== this.expectedEngine) {
      throw new Error(
        `Table ${this.tableName} uses ${actualEngine}, ` +
        `expected ${this.expectedEngine}. ` +
        `Run migration: 001_financial_reports_replacingmerge.sql`
      );
    }
  }

  /**
   * Форматирует текущее время в формате ClickHouse DateTime
   */
  private getCurrentTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }
}
