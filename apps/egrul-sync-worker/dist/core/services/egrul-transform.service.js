"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EgrulTransformService = void 0;
const transform_result_dto_1 = require("../domain/dto/transform-result.dto");
const transform_state_manager_service_1 = require("./transform-state-manager.service");
const transform_aggregator_service_1 = require("./transform-aggregator.service");
const transform_data_fetcher_service_1 = require("./transform-data-fetcher.service");
const transform_metrics_recorder_service_1 = require("./transform-metrics-recorder.service");
const transform_metrics_names_1 = require("./transform-metrics-names");
const STAGING_TABLES = [
    transform_metrics_names_1.TABLE_NAMES.COMPANIES,
    transform_metrics_names_1.TABLE_NAMES.DIRECTORSHIPS,
    transform_metrics_names_1.TABLE_NAMES.OWNERSHIPS
];
/**
 * EGRUL Transform Service
 *
 * @remarks
 * Orchestrates staging → production transformation.
 * Delegates to specialized services for state, aggregation, and metrics.
 */
class EgrulTransformService {
    client;
    stagingStorage;
    memoryMonitor;
    config;
    stateManager;
    aggregator;
    fetcher;
    metricsRecorder;
    constructor(client, stagingStorage, productionStorage, memoryMonitor, config, metrics) {
        this.client = client;
        this.stagingStorage = stagingStorage;
        this.memoryMonitor = memoryMonitor;
        this.config = config;
        this.stateManager = new transform_state_manager_service_1.TransformStateManager(client);
        this.aggregator = new transform_aggregator_service_1.TransformAggregatorService(productionStorage);
        this.fetcher = new transform_data_fetcher_service_1.TransformDataFetcher(client);
        this.metricsRecorder = new transform_metrics_recorder_service_1.TransformMetricsRecorder(metrics);
    }
    async transformIfNeeded() {
        const results = [];
        for (const tableName of STAGING_TABLES) {
            const stats = await this.stagingStorage.getStats(tableName);
            if (stats.needsTransform(this.config.transformThreshold)) {
                const result = await this.transformTable(tableName);
                results.push(result);
            }
        }
        return results;
    }
    async transformTable(tableName) {
        const startTime = Date.now();
        try {
            await this.stateManager.setStatus(tableName, 'running');
            await this.metricsRecorder.recordStart(tableName, this.stagingStorage);
            const hasMemory = await this.memoryMonitor.checkMemoryAvailable(this.config.maxMemoryBytes);
            if (!hasMemory) {
                throw new Error(`Insufficient memory: need ${this.config.maxMemoryBytes} bytes`);
            }
            const { data, totalRows } = await this.fetcher.fetch(tableName);
            await this.metricsRecorder.recordFetch(tableName, Date.now() - startTime);
            if (totalRows === 0) {
                await this.stateManager.setStatus(tableName, 'idle');
                await this.metricsRecorder.recordSuccess(tableName, 0, Date.now() - startTime);
                return transform_result_dto_1.TransformResult.success(tableName, 0, Date.now() - startTime);
            }
            await this.aggregateAndInsert(tableName, data);
            await this.stagingStorage.truncate(tableName);
            await this.stateManager.setStatus(tableName, 'idle');
            const duration = Date.now() - startTime;
            await this.metricsRecorder.recordSuccess(tableName, totalRows, duration);
            return transform_result_dto_1.TransformResult.success(tableName, totalRows, duration);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.stateManager.setError(tableName, message);
            await this.metricsRecorder.recordFailure(tableName, message, Date.now() - startTime);
            return transform_result_dto_1.TransformResult.failure(tableName, message);
        }
    }
    async getTransformStatus() {
        const states = await this.stateManager.getAll();
        return states.map(s => ({
            tableName: s.table_name,
            rowCount: s.last_staging_count,
            status: s.status,
            lastTransformAt: s.last_transform_at,
            errorMessage: s.error_message
        }));
    }
    async resetTransform(tableName) {
        await this.stagingStorage.truncate(tableName);
        await this.stateManager.setStatus(tableName, 'idle');
    }
    /**
     * Aggregate and insert based on table type
     *
     * @param tableName - Staging table name
     * @param data - Grouped staging data
     */
    async aggregateAndInsert(tableName, data) {
        const start = Date.now();
        switch (tableName) {
            case transform_metrics_names_1.TABLE_NAMES.COMPANIES:
                await this.aggregator.aggregateCompanies(data);
                break;
            case transform_metrics_names_1.TABLE_NAMES.DIRECTORSHIPS:
                await this.aggregator.aggregateDirectors(data);
                break;
            case transform_metrics_names_1.TABLE_NAMES.OWNERSHIPS:
                await this.aggregator.aggregateFounders(data);
                break;
            default:
                throw new Error(`Unknown staging table: ${tableName}`);
        }
        await this.metricsRecorder.recordAggregate(tableName, Date.now() - start);
    }
}
exports.EgrulTransformService = EgrulTransformService;
