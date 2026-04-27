/**
 * Репозиторий для работы с unmapped INN
 *
 * @remarks
 * Следует SRP: отвечает только за получение INN без entity mapping.
 * Использует SQL нормализацию для производительности.
 */

import type { ClickHouseClient } from '@clickhouse/client';

/**
 * Репозиторий для работы с unmapped INN
 */
export class UnmappedInnsRepository {
  constructor(private readonly clickhouse: ClickHouseClient) {}

  /**
   * Получает список INN без entity mapping
   *
   * @remarks
   * Использует SQL нормализацию (position + substring) вместо replaceAll().
   * Это в 10-100× быстрее на больших объёмах данных.
   *
   * @param limit - Максимальное количество INN для возврата
   * @returns Массив INN
   */
  async fetchUnmappedInns(limit: number): Promise<string[]> {
    const result = await this.clickhouse.query({
      query: `
        SELECT DISTINCT inn
        FROM (
          SELECT
            if(
              position(director_id, 'ru-inn-') = 1,
              substring(director_id, 8),
              ''
            ) as inn
          FROM egrul_directorships_raw
          WHERE inn != ''
          AND length(inn) = 12
          AND inn NOT IN (
            SELECT raw_id
            FROM egrul_identity_mapping
            WHERE id_type = 'person_entity'
          )
        )
        UNION DISTINCT
        SELECT DISTINCT inn
        FROM (
          SELECT
            if(
              position(owner_id, 'ru-inn-') = 1,
              substring(owner_id, 8),
              ''
            ) as inn
          FROM egrul_ownerships_raw
          WHERE inn != ''
          AND length(inn) = 12
          AND inn NOT IN (
            SELECT raw_id
            FROM egrul_identity_mapping
            WHERE id_type = 'person_entity'
          )
        )
        LIMIT {limit: UInt32}
      `,
      format: 'JSONEachRow',
      query_params: { limit }
    });

    const rows = (await result.json()) as { inn: string }[];
    return rows.map((r) => r.inn);
  }
}
