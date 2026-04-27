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
class SanctionMapper {
  /**
   * Преобразует строку БД в DTO
   */
  rowToDTO(row: SanctionRow): SanctionDTO {
    const now = new Date();
    const endDate = row.end_date ? row.end_date.toISOString() : null;

    return {
      id: row.id,
      inn: row.inn,
      program: row.program,
      programId: row.program_id,
      authority: row.authority,
      country: row.country,
      startDate: row.start_date.toISOString(),
      endDate,
      sourceUrl: row.source_url,
      isActive: endDate === null || new Date(endDate) > now
    };
  }

  /**
   * Преобразует массив строк БД в массив DTO
   */
  rowsToDTO(rows: readonly SanctionRow[]): SanctionDTO[] {
    return rows.map(r => this.rowToDTO(r));
  }
}

export const sanctionMapper = new SanctionMapper();
