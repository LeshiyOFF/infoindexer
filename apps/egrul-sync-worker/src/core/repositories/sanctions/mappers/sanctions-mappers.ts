import type { SanctionDTO } from 'shared/domain/entities';

/**
 * Результат запроса санкций из ClickHouse
 *
 * @remarks
 * Строго типизированный интерфейс для результатов SELECT запросов
 */
export interface ClickHouseSanctionRow {
  readonly id: string;
  readonly inn: string;
  readonly program: string;
  readonly programId: string;
  readonly authority: string;
  readonly country: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly sourceUrl: string;
  readonly isActive: number;
}

/**
 * Результат агрегации по стране/программе
 */
export interface ClickHouseAggregationRow {
  readonly country?: string;
  readonly program?: string;
  readonly cnt: number;
}

/**
 * Результат запроса статистики
 */
export interface ClickHouseStatsRow {
  readonly total: number;
  readonly active: number;
}

/**
 * Type-safe маппер из ClickHouse строки в SanctionDTO
 *
 * @param row - Строка из ClickHouse
 * @returns SanctionDTO для API
 */
export function mapToSanctionDTO(row: ClickHouseSanctionRow): SanctionDTO {
  return {
    id: row.id,
    inn: row.inn,
    program: row.program,
    programId: row.programId,
    authority: row.authority,
    country: row.country,
    startDate: row.startDate,
    endDate: row.endDate,
    sourceUrl: row.sourceUrl,
    isActive: row.isActive === 1
  };
}

/**
 * Строит Record<inn, SanctionDTO[]> из массива строк ClickHouse
 *
 * @param rows - Массив строк из ClickHouse
 * @returns Record с группировкой по ИНН
 */
export function groupByInn(rows: readonly ClickHouseSanctionRow[]): Record<string, SanctionDTO[]> {
  const map: Record<string, SanctionDTO[]> = {};

  for (const row of rows) {
    const { inn } = row;
    if (!map[inn]) {
      map[inn] = [];
    }
    map[inn].push(mapToSanctionDTO(row));
  }

  return map;
}

/**
 * Строит Record<string, number> из массива агрегированных строк
 *
 * @param rows - Массив агрегированных строк
 * @param keyField - Имя поля для ключа ('country' или 'program')
 * @returns Record с подсчётом
 */
export function buildCountMap(
  rows: readonly ClickHouseAggregationRow[],
  keyField: 'country' | 'program'
): Record<string, number> {
  const map: Record<string, number> = {};

  for (const row of rows) {
    const key = row[keyField];
    if (key) {
      map[key] = row.cnt;
    }
  }

  return map;
}
