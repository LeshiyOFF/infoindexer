/**
 * Migration State Detector
 *
 * @remarks
 * Определяет текущее состояние схемы БД относительно миграции.
 * Позволяет обнаружить schema drift - расхождение между историей миграций
 * и фактическим состоянием таблиц.
 */

import type { ClickHouseClient } from '@clickhouse/client';

/**
 * Состояние миграции относительно БД
 *
 * @remarks
 * Упрощённая модель: YAGNI principle. Мы не проверяем drift,
 * потому что миграции идемпотентны (CREATE IF NOT EXISTS).
 * Schema drift будет исправлен следующей миграцией при необходимости.
 */
export enum MigrationState {
  /** Таблица отсутствует - миграция не применялась */
  ABSENT = 'absent',
  /** Таблица существует */
  EXISTS = 'exists',
  /** Не удалось определить состояние (ошибка проверки) */
  UNKNOWN = 'unknown'
}

/**
 * Детектор состояния миграций
 *
 * @remarks
 * Извлекает имя таблицы из SQL миграции и проверяет её существование.
 * Для сложных миграций с несколькими таблицами проверяется первая CREATE TABLE.
 */
export class MigrationStateDetector {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Определяет состояние миграции
   *
   * @param sql - SQL скрипт миграции
   * @returns Состояние миграции
   */
  async detect(sql: string): Promise<MigrationState> {
    const tableName = this.extractTableName(sql);
    if (!tableName) {
      return MigrationState.UNKNOWN;
    }

    const exists = await this.tableExists(tableName);
    if (!exists) {
      return MigrationState.ABSENT;
    }

    return MigrationState.EXISTS;
  }

  /**
   * Извлекает имя таблицы из SQL CREATE TABLE
   *
   * @remarks
   * Парсит SQL и извлекает имя первой создаваемой таблицы.
   * Поддерживает CREATE TABLE и CREATE TABLE IF NOT EXISTS.
   */
  private extractTableName(sql: string): string | null {
    const lines = sql.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.toUpperCase().startsWith('CREATE TABLE')) {
        continue;
      }

      // CREATE TABLE [IF NOT EXISTS] table_name
      const match = trimmed.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Проверяет существование таблицы
   *
   * @param tableName - Имя таблицы
   * @returns true если таблица существует
   */
  private async tableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.client.query({
        query: `
          SELECT count() as cnt
          FROM system.tables
          WHERE database = currentDatabase()
          AND name = {name:String}
        `,
        query_params: { name: tableName },
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ cnt: string }>;
      const count = parseInt(rows[0]?.cnt || '0', 10);

      return count > 0;
    } catch {
      return false;
    }
  }
}
