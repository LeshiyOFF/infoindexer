/**
 * EGRUL Transform Service
 *
 * @remarks
 * SQL-based transform service. Reads from staging tables,
 * resolves entity names/inn via JOIN, writes to production
 * tables. All work happens in ClickHouse (no in-memory data
 * loading on worker side).
 *
 * Architecture (after Migration 022 + Commit 4):
 *   - transformAll() is the single entry point
 *   - Production tables are truncated before transform (start fresh)
 *   - Staging tables are truncated after full success only
 *     (preserves data on partial failure for retry)
 *
 * Memory: ~100MB worker overhead (only ClickHouse client).
 * Time: 5-15 min for full 47M+ row transform.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import type { IMetricsCollectorPort } from '../ports/i-metrics-collector.port';
import type {
  ITransformService,
  TransformTableStatus
} from '../domain/ports/i-transform-service.port';
import type { TransformResult } from '../domain/dto/transform-result.dto';
import { TransformResult as TransformResultImpl } from '../domain/dto/transform-result.dto';
import { TransformStateManager } from './transform-state-manager.service';
import { TransformAggregatorService } from './transform-aggregator.service';
import { TransformMetricsRecorder } from './transform-metrics-recorder.service';
import { TABLE_NAMES } from './transform-metrics-names';

const STAGING_TABLES = [
  TABLE_NAMES.COMPANIES,
  TABLE_NAMES.DIRECTORSHIPS,
  TABLE_NAMES.OWNERSHIPS
] as const;

const PRODUCTION_TABLES = [
  'companies_production',
  'directors_production',
  'founders_production'
] as const;

export class EgrulTransformService implements ITransformService {
  private readonly stateManager: TransformStateManager;
  private readonly aggregator: TransformAggregatorService;
  private readonly metricsRecorder: TransformMetricsRecorder;

  constructor(
    private readonly client: ClickHouseClient,
    private readonly stagingStorage: IStagingStoragePort,
    metrics?: IMetricsCollectorPort
  ) {
    this.stateManager = new TransformStateManager(client);
    this.aggregator = new TransformAggregatorService(client);
    this.metricsRecorder = new TransformMetricsRecorder(metrics);
  }

  async transformAll(): Promise<TransformResult[]> {
    await this.truncateAllProduction();

    const results: TransformResult[] = [];
    results.push(await this.transformCompanies());
    results.push(await this.transformDirectors());
    results.push(await this.transformFounders());

    const allSuccess = results.every(r => r.success);
    if (allSuccess) {
      await this.truncateAllStaging();
    }

    return results;
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

  private async transformCompanies(): Promise<TransformResult> {
    return this.runTransform(
      TABLE_NAMES.COMPANIES,
      () => this.aggregator.aggregateCompanies()
    );
  }

  private async transformDirectors(): Promise<TransformResult> {
    return this.runTransform(
      TABLE_NAMES.DIRECTORSHIPS,
      () => this.aggregator.aggregateDirectors()
    );
  }

  private async transformFounders(): Promise<TransformResult> {
    return this.runTransform(
      TABLE_NAMES.OWNERSHIPS,
      () => this.aggregator.aggregateFounders()
    );
  }

  private async runTransform(
    tableName: string,
    operation: () => Promise<number>
  ): Promise<TransformResult> {
    const startTime = Date.now();

    try {
      await this.stateManager.setStatus(tableName, 'running');
      await this.metricsRecorder.recordStart(tableName, this.stagingStorage);

      const rowsWritten = await operation();

      await this.stateManager.setStatus(tableName, 'idle');
      const duration = Date.now() - startTime;
      await this.metricsRecorder.recordSuccess(tableName, rowsWritten, duration);

      return TransformResultImpl.success(tableName, rowsWritten, duration);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.stateManager.setError(tableName, message);
      await this.metricsRecorder.recordFailure(tableName, message, Date.now() - startTime);
      return TransformResultImpl.failure(tableName, message);
    }
  }

  private async truncateAllProduction(): Promise<void> {
    for (const tableName of PRODUCTION_TABLES) {
      await this.client.command({
        query: `TRUNCATE TABLE ${tableName}`
      });
    }
  }

  private async truncateAllStaging(): Promise<void> {
    for (const tableName of STAGING_TABLES) {
      await this.stagingStorage.truncate(tableName);
    }
  }
}
