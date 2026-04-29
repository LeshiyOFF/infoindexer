/**
 * Transform Aggregator Service
 *
 * @remarks
 * Aggregates staging data into production format.
 * Follows SRP: only responsible for data aggregation.
 *
 * @pattern Single Responsibility Principle
 * @pattern Strategy Pattern (table-specific aggregation)
 */
import type { IProductionStorage } from '../domain/ports/i-production-storage.port';
import type {
  ProductionCompanyRow,
  ProductionDirectorRow,
  ProductionFounderRow
} from '../domain/ports/i-production-storage.port';
import type {
  StagingCompanyDbRow,
  StagingDirectorshipDbRow,
  StagingOwnershipDbRow
} from './transform-data-fetcher.service';

/**
 * Transform Aggregator Service
 *
 * @remarks
 * Performs table-specific aggregation logic.
 * Uses strict typing - no any/unknown types.
 */
export class TransformAggregatorService {
  constructor(private readonly productionStorage: IProductionStorage) {}

  /**
   * Aggregate and insert companies
   *
   * @param data - Grouped staging data by INN
   */
  async aggregateCompanies(data: Map<string, unknown[]>): Promise<number> {
    const companies: ProductionCompanyRow[] = [];

    for (const [inn, rows] of data) {
      const typedRows = rows as StagingCompanyDbRow[];
      const latest = this.getLatestCompanyRow(typedRows);
      companies.push({
        inn,
        name: latest.name,
        status: latest.status,
        address: latest.address,
        updated_at: new Date()
      });
    }

    if (companies.length === 0) {
      return 0;
    }

    return this.productionStorage.insertCompanies(companies);
  }

  /**
   * Aggregate and insert directors
   *
   * @param data - Grouped staging data by organization_id
   */
  async aggregateDirectors(data: Map<string, unknown[]>): Promise<number> {
    const directors: ProductionDirectorRow[] = [];
    const seen = new Set<string>();

    for (const [orgId, rows] of data) {
      const typedRows = rows as StagingDirectorshipDbRow[];
      for (const row of typedRows) {
        const key = `${orgId}:${row.director_id}`;
        if (!seen.has(key)) {
          seen.add(key);
          directors.push({
            inn: orgId,
            director_name: row.director_id,
            updated_at: new Date()
          });
        }
      }
    }

    if (directors.length === 0) {
      return 0;
    }

    return this.productionStorage.insertDirectors(directors);
  }

  /**
   * Aggregate and insert founders
   *
   * @param data - Grouped staging data by asset_id
   */
  async aggregateFounders(data: Map<string, unknown[]>): Promise<number> {
    const founders: ProductionFounderRow[] = [];
    const seen = new Set<string>();

    for (const [assetId, rows] of data) {
      const typedRows = rows as StagingOwnershipDbRow[];
      for (const row of typedRows) {
        const key = `${assetId}:${row.owner_id}`;
        if (!seen.has(key)) {
          seen.add(key);
          founders.push({
            inn: assetId,
            founder_name: row.owner_id,
            updated_at: new Date()
          });
        }
      }
    }

    if (founders.length === 0) {
      return 0;
    }

    return this.productionStorage.insertFounders(founders);
  }

  /**
   * Get latest company row by date
   *
   * @param rows - Array of company rows
   * @returns Row with latest date
   */
  private getLatestCompanyRow(rows: StagingCompanyDbRow[]): StagingCompanyDbRow {
    return rows.reduce((a, b) => {
      const dateA = new Date(a.last_changed || a.first_seen || 0);
      const dateB = new Date(b.last_changed || b.first_seen || 0);
      return dateB > dateA ? b : a;
    });
  }
}
