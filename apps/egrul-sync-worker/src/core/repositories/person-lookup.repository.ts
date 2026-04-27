import type { ClickHouseClient } from '@clickhouse/client';

/**
 * Сущность Person для поиска
 */
export interface PersonLookup {
  id: string;
  name: string;
}

/**
 * Репозиторий для поиска Person entities
 */
export class PersonLookupRepository {
  constructor(private readonly clickhouse: ClickHouseClient) {}

  /**
   * Получает все Person из raw таблицы для fuzzy matching
   */
  async fetchAllPersons(): Promise<PersonLookup[]> {
    const result = await this.clickhouse.query({
      query: `SELECT id, name FROM egrul_persons_raw WHERE length(name) > 3`,
      format: 'JSONEachRow'
    });

    return (await result.json()) as PersonLookup[];
  }
}
