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
 * Time complexity: 1-2 min for companies (single query),
 *   10-30 min for directors and founders (chunked into 10 sequential
 *   sub-queries each, single-threaded for memory safety on 4GB container).
 */
import type { ClickHouseClient, CommandResult } from '@clickhouse/client';

export class TransformAggregatorService {
  private static readonly CHUNK_COUNT = 10;

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
        SETTINGS
          max_memory_usage = 2147483648,
          max_bytes_before_external_group_by = 1073741824,
          max_bytes_before_external_sort = 1073741824,
          join_algorithm = 'auto',
          max_threads = 1
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
    let totalWritten = 0;

    for (let chunk = 0; chunk < TransformAggregatorService.CHUNK_COUNT; chunk++) {
      try {
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
            LEFT JOIN (
              SELECT id, name, inn
              FROM egrul_staging_entities
              WHERE cityHash64(id) % ${TransformAggregatorService.CHUNK_COUNT} = ${chunk}
            ) e
              ON d.director_id = e.id
            WHERE cityHash64(d.director_id) % ${TransformAggregatorService.CHUNK_COUNT} = ${chunk}
            SETTINGS
              max_memory_usage = 2147483648,
              max_bytes_before_external_group_by = 1073741824,
              max_bytes_before_external_sort = 1073741824,
              join_algorithm = 'auto',
              max_threads = 1
          `
        });
        totalWritten += this.extractWrittenRows(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `aggregateDirectors failed at chunk ${chunk + 1}/${TransformAggregatorService.CHUNK_COUNT}: ${message}`
        );
      }
    }

    return totalWritten;
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
    let totalWritten = 0;

    for (let chunk = 0; chunk < TransformAggregatorService.CHUNK_COUNT; chunk++) {
      try {
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
            LEFT JOIN (
              SELECT id, name, inn
              FROM egrul_staging_entities
              WHERE cityHash64(id) % ${TransformAggregatorService.CHUNK_COUNT} = ${chunk}
            ) e
              ON o.owner_id = e.id
            WHERE cityHash64(o.owner_id) % ${TransformAggregatorService.CHUNK_COUNT} = ${chunk}
            SETTINGS
              max_memory_usage = 2147483648,
              max_bytes_before_external_group_by = 1073741824,
              max_bytes_before_external_sort = 1073741824,
              join_algorithm = 'auto',
              max_threads = 1
          `
        });
        totalWritten += this.extractWrittenRows(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `aggregateFounders failed at chunk ${chunk + 1}/${TransformAggregatorService.CHUNK_COUNT}: ${message}`
        );
      }
    }

    return totalWritten;
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
