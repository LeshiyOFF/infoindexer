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
import type { IMetricsCollectorPort } from '../ports/i-metrics-collector.port';
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
import { TransformMetricsRecorder } from './transform-metrics-recorder.service';
import { TABLE_NAMES } from './transform-metrics-names';

const STAGING_TABLES = [
  TABLE_NAMES.COMPANIES,
  TABLE_NAMES.DIRECTORSHIPS,
  TABLE_NAMES.OWNERSHIPS
] as const;

/**
 * EGRUL Transform Service
 *
 * @remarks
 * Orchestrates staging → production transformation.
 * Delegates to specialized services for state, aggregation, and metrics.
 */
export class EgrulTransformService implements ITransformService {
  private readonly stateManager: TransformStateManager;
  private readonly aggregator: TransformAggregatorService;
  private readonly fetcher: TransformDataFetcher;
  private readonly metricsRecorder: TransformMetricsRecorder;

  constructor(
    private readonly client: ClickHouseClient,
    private readonly stagingStorage: IStagingStoragePort,
    productionStorage: IProductionStorage,
    private readonly memoryMonitor: IMemoryMonitor,
    private readonly config: StagingConfig,
    metrics?: IMetricsCollectorPort
  ) {
    this.stateManager = new TransformStateManager(client);
    this.aggregator = new TransformAggregatorService(productionStorage);
    this.fetcher = new TransformDataFetcher(client);
    this.metricsRecorder = new TransformMetricsRecorder(metrics);
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
      await this.metricsRecorder.recordStart(tableName, this.stagingStorage);

      const hasMemory = await this.memoryMonitor.checkMemoryAvailable(
        this.config.maxMemoryBytes
      );
      if (!hasMemory) {
        throw new Error(
          `Insufficient memory: need ${this.config.maxMemoryBytes} bytes`
        );
      }

      const { data, totalRows } = await this.fetcher.fetch(tableName);
      await this.metricsRecorder.recordFetch(tableName, Date.now() - startTime);

      if (totalRows === 0) {
        await this.stateManager.setStatus(tableName, 'idle');
        await this.metricsRecorder.recordSuccess(tableName, 0, Date.now() - startTime);
        return TransformResultImpl.success(tableName, 0, Date.now() - startTime);
      }

      await this.aggregateAndInsert(tableName, data);
      await this.stagingStorage.truncate(tableName);
      await this.stateManager.setStatus(tableName, 'idle');

      const duration = Date.now() - startTime;
      await this.metricsRecorder.recordSuccess(tableName, totalRows, duration);
      return TransformResultImpl.success(tableName, totalRows, duration);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.stateManager.setError(tableName, message);
      await this.metricsRecorder.recordFailure(tableName, message, Date.now() - startTime);
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
    const start = Date.now();

    switch (tableName) {
      case TABLE_NAMES.COMPANIES:
        await this.aggregator.aggregateCompanies(data);
        break;

      case TABLE_NAMES.DIRECTORSHIPS:
        await this.aggregator.aggregateDirectors(data);
        break;

      case TABLE_NAMES.OWNERSHIPS:
        await this.aggregator.aggregateFounders(data);
        break;

      default:
        throw new Error(`Unknown staging table: ${tableName}`);
    }

    await this.metricsRecorder.recordAggregate(tableName, Date.now() - start);
  }
}
