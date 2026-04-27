/**
 * Adapter для управления meta tables в ClickHouse
 *
 * @remarks
 * Реализует Port IMetaStorage для ClickHouse.
 * Отвечает за CRUD операции с существующими таблицами.
 * Создание таблиц происходит через миграции при старте приложения.
 *
 * Stateful операции:
 * - clearPartialData: TRUNCATE raw tables + identity_mapping (сохраняет схему)
 * - cleanupRawTables: TRUNCATE raw tables после успешной синхронизации
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type {
  EgrulCompanyRow,
  EgrulDirectorshipRow,
  EgrulOwnershipRow,
  EgrulPersonRow
} from '../../entities';
import type {
  EgrulDirectorRow,
  EgrulFounderRow
} from '../../domain/entities';
import type { IMetaStorage } from './ports';
import { TypeGuardUtil } from '../../utils/type-guards.util';

/**
 * Union type for all supported row types
 *
 * @remarks
 * Includes both legacy (intermediate) and MV (direct insert) row types.
 */
export type SupportedRow =
  | EgrulCompanyRow
  | EgrulPersonRow
  | EgrulDirectorshipRow
  | EgrulOwnershipRow
  | EgrulDirectorRow
  | EgrulFounderRow;

/**
 * Adapter для управления meta tables в ClickHouse
 *
 * @remarks
 * Следует SRP: отвечает только за операции с данными,
 * не за создание схемы (DDL).
 */
export class ClickHouseMetaRepository implements IMetaStorage {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Конвертирует Date в Unix timestamp (ms) для ClickHouse DateTime64(3, 'UTC')
   *
   * @remarks
   * DateTime64 хранит Unix timestamp в микросекундах.
   * Для DateTime64(3) precision=3 → milliseconds, поэтому используем getTime().
   */
  private formatDate(date: Date | undefined): number | undefined {
    return date?.getTime();
  }

  /**
   * Проверяет наличие временных полей в записи
   */
  private hasTemporalFields(obj: unknown): obj is { first_seen?: Date; last_changed?: Date } {
    return typeof obj === 'object' && obj !== null &&
      ('first_seen' in obj || 'last_changed' in obj);
  }

  /**
   * Подготавливает записи для вставки, форматируя даты
   *
   * @remarks
   * Только Company и Person имеют временные поля.
   * MV row types (DirectorRow, FounderRow) don't have temporal fields.
   */
  private prepareRecords(
    values: SupportedRow[]
  ): Record<string, unknown>[] {
    return values.map(v => {
      if (this.hasTemporalFields(v)) {
        return {
          ...v,
          first_seen: this.formatDate(v.first_seen),
          last_changed: this.formatDate(v.last_changed)
        };
      }
      return v;
    }) as Record<string, unknown>[];
  }

  /**
   * Вставляет батч записей в указанную таблицу
   *
   * @param table - Имя таблицы
   * @param values - Массив записей
   *
   * @remarks
   * Supports both legacy and MV row types.
   */
  async insertBatch(
    table: string,
    values: SupportedRow[]
  ): Promise<void> {
    if (values.length === 0) {
      return;
    }

    const records = this.prepareRecords(values);

    await this.client.insert({
      table,
      values: records,
      format: 'JSONEachRow'
    });
  }

  /**
   * Очищает временные raw таблицы после обработки
   *
   * @remarks
   * Удаляет данные из временных таблиц после импорта в целевые таблицы.
   * Таблицы пересоздаются через TRUNCATE для сохранения схемы.
   */
  async cleanupRawTables(): Promise<void> {
    const tables = [
      'egrul_companies_raw',
      'egrul_persons_raw',
      'egrul_directorships_raw',
      'egrul_ownerships_raw'
    ];

    for (const table of tables) {
      await this.client.command({ query: `TRUNCATE TABLE IF EXISTS ${table}` });
    }
  }

  /**
   * Удаляет частично загруженные данные при abort
   *
   * @remarks
   * Очищает raw таблицы через TRUNCATE.
   * identity_mapping очищается через TRUNCATE (не DROP) для пересборки.
   * companies_meta не затрагивается (полная перезагрузка).
   */
  async clearPartialData(): Promise<void> {
    const rawTables = [
      'egrul_companies_raw',
      'egrul_persons_raw',
      'egrul_directorships_raw',
      'egrul_ownerships_raw',
      'egrul_identity_mapping'
    ];

    for (const table of rawTables) {
      await this.client.command({ query: `TRUNCATE TABLE IF EXISTS ${table}` });
    }
  }
}
