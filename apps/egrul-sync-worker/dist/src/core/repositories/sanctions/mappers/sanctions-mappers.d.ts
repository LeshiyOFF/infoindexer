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
export declare function mapToSanctionDTO(row: ClickHouseSanctionRow): SanctionDTO;
/**
 * Строит Record<inn, SanctionDTO[]> из массива строк ClickHouse
 *
 * @param rows - Массив строк из ClickHouse
 * @returns Record с группировкой по ИНН
 */
export declare function groupByInn(rows: readonly ClickHouseSanctionRow[]): Record<string, SanctionDTO[]>;
/**
 * Строит Record<string, number> из массива агрегированных строк
 *
 * @param rows - Массив агрегированных строк
 * @param keyField - Имя поля для ключа ('country' или 'program')
 * @returns Record с подсчётом
 */
export declare function buildCountMap(rows: readonly ClickHouseAggregationRow[], keyField: 'country' | 'program'): Record<string, number>;
