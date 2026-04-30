import type { ClickHouseClient } from '@clickhouse/client';
/**
 * Репозиторий для enrichment mapping записей
 */
export declare class EnrichmentMappingRepository {
    private readonly clickhouse;
    constructor(clickhouse: ClickHouseClient);
    /**
     * Создаёт双向 маппинг для enrichment результата
     */
    insertMapping(inn: string, personId: string, confidence: number): Promise<void>;
}
