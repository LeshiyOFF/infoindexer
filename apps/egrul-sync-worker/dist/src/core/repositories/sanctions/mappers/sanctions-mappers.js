"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToSanctionDTO = mapToSanctionDTO;
exports.groupByInn = groupByInn;
exports.buildCountMap = buildCountMap;
/**
 * Type-safe маппер из ClickHouse строки в SanctionDTO
 *
 * @param row - Строка из ClickHouse
 * @returns SanctionDTO для API
 */
function mapToSanctionDTO(row) {
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
function groupByInn(rows) {
    const map = {};
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
function buildCountMap(rows, keyField) {
    const map = {};
    for (const row of rows) {
        const key = row[keyField];
        if (key) {
            map[key] = row.cnt;
        }
    }
    return map;
}
