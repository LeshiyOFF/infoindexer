import type { ClickHouseClient } from '@clickhouse/client';

/**
 * Репозиторий для enrichment mapping записей
 */
export class EnrichmentMappingRepository {
  constructor(private readonly clickhouse: ClickHouseClient) {}

  /**
   * Создаёт双向 маппинг для enrichment результата
   */
  async insertMapping(
    inn: string,
    personId: string,
    confidence: number
  ): Promise<void> {
    const nowStr = new Date().toISOString();

    await this.clickhouse.command({
      query: `
        INSERT INTO egrul_identity_mapping (id_type, raw_id, canonical_id, entity_type, source, confidence, created_at, updated_at)
        VALUES
          ('person_entity', {personId: String}, {personId: String}, 'person', 'enriched_entity', 1.0, {nowStr: String}, {nowStr: String}),
          ('person_inn_enriched', {inn: String}, {personId: String}, 'person', 'dadata_fuzzy', {confidence: Float32}, {nowStr: String}, {nowStr: String})
      `,
      query_params: {
        personId,
        inn,
        confidence,
        nowStr
      }
    });
  }
}
