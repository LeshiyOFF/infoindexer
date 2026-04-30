/**
 * ClickHouse Sanctions Mapper
 *
 * Преобразование между форматами БД и DTO.
 */
import type { SanctionRow } from 'shared/repositories';
import type { SanctionDTO } from 'shared/domain/entities';
/**
 * Маппер для конвертации строк БД в DTO
 */
declare class SanctionMapper {
    /**
     * Преобразует строку БД в DTO
     */
    rowToDTO(row: SanctionRow): SanctionDTO;
    /**
     * Преобразует массив строк БД в массив DTO
     */
    rowsToDTO(rows: readonly SanctionRow[]): SanctionDTO[];
}
export declare const sanctionMapper: SanctionMapper;
export {};
