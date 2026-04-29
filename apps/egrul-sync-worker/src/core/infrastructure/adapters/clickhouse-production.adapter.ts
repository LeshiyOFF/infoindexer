/**
 * ClickHouse Production Adapter
 *
 * @remarks
 * Implementation of IProductionStorage for ClickHouse.
 * Follows Adapter pattern: infrastructure detail.
 * Follows SRP: only handles production table operations.
 *
 * Production tables from Migration 018:
 * - companies_production (aggregated companies)
 * - directors_production (aggregated directors)
 * - founders_production (aggregated founders)
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Single Responsibility Principle
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type {
  IProductionStorage,
  ProductionCompanyRow,
  ProductionDirectorRow,
  ProductionFounderRow
} from '../../domain/ports/i-production-storage.port';
import { ProductionStats } from '../../domain/dto/production-stats.dto';
import type { SystemPartsRow } from '../../domain/dto/production-stats.dto';

export class ClickHouseProductionAdapter implements IProductionStorage {
  constructor(private readonly client: ClickHouseClient) {}

  async insertCompanies(companies: readonly ProductionCompanyRow[]): Promise<number> {
    if (companies.length === 0) return 0;

    await this.client.insert({
      table: 'companies_production',
      values: companies,
      format: 'JSONEachRow'
    });

    return companies.length;
  }

  async insertDirectors(directors: readonly ProductionDirectorRow[]): Promise<number> {
    if (directors.length === 0) return 0;

    await this.client.insert({
      table: 'directors_production',
      values: directors,
      format: 'JSONEachRow'
    });

    return directors.length;
  }

  async insertFounders(founders: readonly ProductionFounderRow[]): Promise<number> {
    if (founders.length === 0) return 0;

    await this.client.insert({
      table: 'founders_production',
      values: founders,
      format: 'JSONEachRow'
    });

    return founders.length;
  }

  async getStats(tableName: string): Promise<ProductionStats> {
    const result = await this.client.query({
      query: `
        SELECT
          table as table_name,
          sum(rows) as rows,
          sum(bytes_on_disk) as bytes_on_disk
        FROM system.parts
        WHERE table = {table_name: String}
          AND active = 1
        GROUP BY table
      `,
      query_params: { table_name: tableName },
      format: 'JSONEachRow'
    });

    const rows = await result.json() as SystemPartsRow[];

    if (rows.length === 0) {
      return new ProductionStats(tableName, 0, 0, new Date());
    }

    return ProductionStats.fromClickHouse({
      table_name: rows[0].table_name,
      rows: rows[0].rows,
      bytes_on_disk: rows[0].bytes_on_disk
    });
  }
}
