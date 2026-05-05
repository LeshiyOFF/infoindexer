/**
 * Transform Aggregator Service
 *
 * @remarks
 * SQL-based aggregator that transforms staging data into production tables.
 * Uses ClickHouse JOIN for entity name/inn resolution instead of in-memory
 * processing (which would require 15-20GB heap for 47M+ staging rows).
 *
 * Architecture (after Migration 022 + Commit 4):
 *   - companies_production from egrul_staging_entities (filtered by schema)
 *   - directors_production from staging_directorships JOIN staging_entities
 *   - founders_production from staging_ownerships JOIN staging_entities
 *
 * Memory footprint: ~100MB worker heap (only ClickHouse client overhead).
 * Time complexity: 5-15 minutes for full transform of 47M+ staging rows.
 */
import type { ClickHouseClient, CommandResult } from '@clickhouse/client';

export class TransformAggregatorService {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Transforms base entities (Company, Organization, LegalEntity)
   * from staging into companies_production.
   *
   * @returns Number of rows inserted
   */
  async aggregateCompanies(): Promise<number> {
    const result = await this.client.command({
      query: `
        INSERT INTO companies_production
          (inn, name, status, address, updated_at)
        SELECT
          assumeNotNull(e.inn) AS inn,
          e.name,
          e.status,
          e.address,
          now64() AS updated_at
        FROM egrul_staging_entities e
        WHERE e.schema IN ('Company', 'Organization', 'LegalEntity')
          AND e.inn IS NOT NULL
        SETTINGS max_threads = 4
      `
    });

    return this.extractWrittenRows(result);
  }

  /**
   * Transforms directorships into directors_production with name/inn
   * resolution via JOIN with staging_entities.
   *
   * Strips 'ru-inn-' prefix from organization_id to store clean INN.
   *
   * @returns Number of rows inserted
   */
  async aggregateDirectors(): Promise<number> {
    const result = await this.client.command({
      query: `
        INSERT INTO directors_production
          (inn_company, director_id, director_name, director_inn, updated_at)
        SELECT
          replaceRegexpOne(d.organization_id, '^ru-inn-', '') AS inn_company,
          d.director_id,
          e.name AS director_name,
          e.inn AS director_inn,
          now64() AS updated_at
        FROM egrul_staging_directorships d
        LEFT JOIN egrul_staging_entities e
          ON d.director_id = e.id
        SETTINGS max_threads = 4
      `
    });

    return this.extractWrittenRows(result);
  }

  /**
   * Transforms ownerships into founders_production with name/inn
   * resolution via JOIN with staging_entities.
   *
   * Strips 'ru-inn-' prefix from asset_id to store clean INN.
   *
   * @returns Number of rows inserted
   */
  async aggregateFounders(): Promise<number> {
    const result = await this.client.command({
      query: `
        INSERT INTO founders_production
          (inn_company, founder_id, founder_name, founder_inn, updated_at)
        SELECT
          replaceRegexpOne(o.asset_id, '^ru-inn-', '') AS inn_company,
          o.owner_id AS founder_id,
          e.name AS founder_name,
          e.inn AS founder_inn,
          now64() AS updated_at
        FROM egrul_staging_ownerships o
        LEFT JOIN egrul_staging_entities e
          ON o.owner_id = e.id
        SETTINGS max_threads = 4
      `
    });

    return this.extractWrittenRows(result);
  }

  /**
   * Extracts written_rows count from ClickHouse CommandResult.
   */
  private extractWrittenRows(result: CommandResult): number {
    const writtenRows = result.summary?.written_rows;
    if (typeof writtenRows !== 'string') {
      return 0;
    }
    const parsed = Number.parseInt(writtenRows, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
