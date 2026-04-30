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
import type { ITransformService, TransformTableStatus } from '../domain/ports/i-transform-service.port';
import type { StagingConfig } from '../domain/value-objects/staging-config.vo';
import type { TransformResult } from '../domain/dto/transform-result.dto';
/**
 * EGRUL Transform Service
 *
 * @remarks
 * Orchestrates staging → production transformation.
 * Delegates to specialized services for state, aggregation, and metrics.
 */
export declare class EgrulTransformService implements ITransformService {
    private readonly client;
    private readonly stagingStorage;
    private readonly memoryMonitor;
    private readonly config;
    private readonly stateManager;
    private readonly aggregator;
    private readonly fetcher;
    private readonly metricsRecorder;
    constructor(client: ClickHouseClient, stagingStorage: IStagingStoragePort, productionStorage: IProductionStorage, memoryMonitor: IMemoryMonitor, config: StagingConfig, metrics?: IMetricsCollectorPort);
    transformIfNeeded(): Promise<TransformResult[]>;
    transformTable(tableName: string): Promise<TransformResult>;
    getTransformStatus(): Promise<TransformTableStatus[]>;
    resetTransform(tableName: string): Promise<void>;
    /**
     * Aggregate and insert based on table type
     *
     * @param tableName - Staging table name
     * @param data - Grouped staging data
     */
    private aggregateAndInsert;
}
