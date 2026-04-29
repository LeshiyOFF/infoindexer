/**
 * EGRUL Transform Service
 *
 * @remarks
 * Core service for staging → production transformation.
 * Follows SRP: orchestrates transform workflow.
 * Follows DIP: depends on ports, not concrete adapters.
 *
 * @pattern Single Responsibility Principle
 * @pattern Dependency Inversion Principle
 * @pattern Hexagonal / Ports & Adapters
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import type { IProductionStorage } from '../domain/ports/i-production-storage.port';
import type { IMemoryMonitor } from '../domain/ports/i-memory-monitor.port';
import type {
  ITransformService,
  TransformTableStatus
} from '../domain/ports/i-transform-service.port';
import type { StagingConfig } from '../domain/value-objects/staging-config.vo';
import type { TransformResult } from '../domain/dto/transform-result.dto';
import { TransformResult as TransformResultImpl } from '../domain/dto/transform-result.dto';
import { TransformStateManager } from './transform-state-manager.service';
import { TransformAggregatorService } from './transform-aggregator.service';
import { TransformDataFetcher } from './transform-data-fetcher.service';

const STAGING_TABLES = [
  'egrul_staging_companies',
  'egrul_staging_directorships',
  'egrul_staging_ownerships'
] as const;

/**
 * EGRUL Transform Service
 *
 * @remarks
 * Orchestrates staging → production transformation.
 * Delegates to specialized services for state, aggregation, and fetching.
 */
export class EgrulTransformService implements ITransformService {
  private readonly stateManager: TransformStateManager;
  private readonly aggregator: TransformAggregatorService;
  private readonly fetcher: TransformDataFetcher;

  constructor(
    private readonly client: ClickHouseClient,
    private readonly stagingStorage: IStagingStoragePort,
    productionStorage: IProductionStorage,
    private readonly memoryMonitor: IMemoryMonitor,
    private readonly config: StagingConfig
  ) {
    this.stateManager = new TransformStateManager(client);
    this.aggregator = new TransformAggregatorService(productionStorage);
    this.fetcher = new TransformDataFetcher(client);
  }

  async transformIfNeeded(): Promise<TransformResult[]> {
    const results: TransformResult[] = [];

    for (const tableName of STAGING_TABLES) {
      const stats = await this.stagingStorage.getStats(tableName);

      if (stats.needsTransform(this.config.transformThreshold)) {
        const result = await this.transformTable(tableName);
        results.push(result);
      }
    }

    return results;
  }

  async transformTable(tableName: string): Promise<TransformResult> {
    const startTime = Date.now();

    try {
      await this.stateManager.setStatus(tableName, 'running');

      const hasMemory = await this.memoryMonitor.checkMemoryAvailable(
        this.config.maxMemoryBytes
      );
      if (!hasMemory) {
        throw new Error(
          `Insufficient memory: need ${this.config.maxMemoryBytes} bytes`
        );
      }

      const { data, totalRows } = await this.fetcher.fetch(tableName);

      if (totalRows === 0) {
        await this.stateManager.setStatus(tableName, 'idle');
        return TransformResultImpl.success(tableName, 0, Date.now() - startTime);
      }

      await this.aggregateAndInsert(tableName, data);

      await this.stagingStorage.truncate(tableName);

      await this.stateManager.setStatus(tableName, 'idle');

      return TransformResultImpl.success(tableName, totalRows, Date.now() - startTime);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.stateManager.setError(tableName, message);
      return TransformResultImpl.failure(tableName, message);
    }
  }

  async getTransformStatus(): Promise<TransformTableStatus[]> {
    const states = await this.stateManager.getAll();

    return states.map(s => ({
      tableName: s.table_name,
      rowCount: s.last_staging_count,
      status: s.status as TransformTableStatus['status'],
      lastTransformAt: s.last_transform_at,
      errorMessage: s.error_message
    }));
  }

  async resetTransform(tableName: string): Promise<void> {
    await this.stagingStorage.truncate(tableName);
    await this.stateManager.setStatus(tableName, 'idle');
  }

  /**
   * Aggregate and insert based on table type
   *
   * @param tableName - Staging table name
   * @param data - Grouped staging data
   */
  private async aggregateAndInsert(
    tableName: string,
    data: Map<string, unknown[]>
  ): Promise<void> {
    switch (tableName) {
      case 'egrul_staging_companies':
        await this.aggregator.aggregateCompanies(data);
        break;

      case 'egrul_staging_directorships':
        await this.aggregator.aggregateDirectors(data);
        break;

      case 'egrul_staging_ownerships':
        await this.aggregator.aggregateFounders(data);
        break;

      default:
        throw new Error(`Unknown staging table: ${tableName}`);
    }
  }
}
