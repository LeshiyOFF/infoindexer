import type { SanctionRow } from 'shared/repositories/sanction.repository';

/**
 * Подготавливает значения для вставки в ClickHouse
 *
 * @param row - Строка санкций
 * @returns Объект для вставки в БД
 */
export function prepareInsertValue(row: SanctionRow): Record<string, unknown> {
  return {
    id: row.id,
    inn: row.inn,
    program: row.program,
    program_id: row.program_id,
    authority: row.authority,
    country: row.country,
    start_date: row.start_date,
    end_date: row.end_date,
    source_url: row.source_url,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * Подготавливает батч значений для вставки в ClickHouse
 *
 * @param rows - Массив строк санкций
 * @returns Массив объектов для вставки в БД
 */
export function prepareInsertBatch(rows: readonly SanctionRow[]): Record<string, unknown>[] {
  return rows.map(prepareInsertValue);
}
