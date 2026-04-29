"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeServices = initializeServices;
const shared_1 = require("shared");
const adapters_1 = require("./core/adapters");
const http_client_1 = require("./core/infrastructure/http-client");
const clickhouse_repository_1 = require("./core/repositories/clickhouse.repository");
const clickhouse_batch_adapter_1 = require("./core/repositories/adapters/clickhouse-batch.adapter");
const clickhouse_incremental_adapter_1 = require("./core/repositories/adapters/clickhouse-incremental.adapter");
const clickhouse_sync_state_adapter_1 = require("./core/repositories/adapters/clickhouse-sync-state.adapter");
const batch_config_vo_1 = require("./core/domain/value-objects/batch-config.vo");
const identity_mapping_service_1 = require("./core/repositories/identity-mapping.service");
const denormalized_relations_repository_1 = require("./core/repositories/denormalized-relations.repository");
const denormalization_service_1 = require("./core/services/denormalization.service");
const entity_parser_service_1 = require("./core/entity-parser.service");
const sanction_parser_service_1 = require("./core/parsers/sanction-parser.service");
const progress_reporter_1 = require("./core/infrastructure/progress-reporter");
const external_enrichment_service_1 = require("./core/services/external-enrichment.service");
const staging_sync_service_1 = require("./core/services/staging-sync.service");
const staging_transform_service_1 = require("./core/services/staging-transform.service");
const clickhouse_staging_adapter_1 = require("./core/infrastructure/adapters/clickhouse-staging.adapter");
const clickhouse_identity_resolver_adapter_1 = require("./core/infrastructure/adapters/clickhouse-identity-resolver.adapter");
const mv_insert_adapter_1 = require("./core/infrastructure/adapters/mv-insert.adapter");
const dadata_adapter_1 = require("./core/adapters/dadata-adapter");
const fuzzy_matcher_service_1 = require("./core/services/fuzzy-matcher.service");
const enrichment_batch_processor_service_1 = require("./core/services/enrichment-batch-processor.service");
const unmapped_inns_repository_1 = require("./core/repositories/unmapped-inns.repository");
const person_lookup_repository_1 = require("./core/repositories/person-lookup.repository");
const enrichment_mapping_repository_1 = require("./core/repositories/enrichment-mapping.repository");
const workers_1 = require("./core/workers");
const egrul_sync_service_1 = require("./core/egrul-sync.service");
const sanctions_only_service_1 = require("./core/sanctions-only.service");
const graceful_shutdown_service_1 = require("./core/domain/graceful-shutdown.service");
const console_metrics_adapter_1 = require("./core/infrastructure/adapters/console-metrics.adapter");
const null_metrics_adapter_1 = require("./core/infrastructure/adapters/null-metrics.adapter");
const clickhouse_metrics_service_1 = require("./core/infrastructure/clickhouse-metrics.service");
const shutdown_handlers_1 = require("./shutdown-handlers");
const circuit_breaker_manager_service_1 = require("./core/domain/circuit-breaker-manager.service");
const health_check_service_1 = require("./core/domain/health-check.service");
const circuit_breaker_adapter_1 = require("./core/infrastructure/adapters/circuit-breaker.adapter");
const circuit_breaker_config_factory_1 = require("./core/domain/factories/circuit-breaker-config.factory");
/**
 * Initialize all application services
 */
async function initializeServices(clickhouseClient, proxyAgent) {
    // ===== METRICS (Phase 7) =====
    // Создаём коллектор метрик на основе ENV переменной
    const enableMetrics = process.env.ENABLE_METRICS === 'true';
    const metrics = enableMetrics
        ? new console_metrics_adapter_1.ConsoleMetricsAdapter()
        : new null_metrics_adapter_1.NullMetricsAdapter();
    const clickhouseMetrics = new clickhouse_metrics_service_1.ClickHouseMetricsService(metrics);
    if (enableMetrics) {
        console.log('Metrics collection enabled (Console adapter)');
    }
    else {
        console.log('Metrics collection disabled (Null adapter)');
    }
    // ===== CIRCUIT BREAKER MANAGER (Phase 9) =====
    const circuitBreakerManager = new circuit_breaker_manager_service_1.CircuitBreakerManager();
    // Регистрируем named circuit breakers для ClickHouse операций
    const defaultConfig = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
    circuitBreakerManager.registerFactory('identity:persons', () => new circuit_breaker_adapter_1.CircuitBreakerAdapter('identity:persons', defaultConfig, metrics));
    circuitBreakerManager.registerFactory('identity:companies', () => new circuit_breaker_adapter_1.CircuitBreakerAdapter('identity:companies', defaultConfig, metrics));
    circuitBreakerManager.registerFactory('identity:inn', () => new circuit_breaker_adapter_1.CircuitBreakerAdapter('identity:inn', defaultConfig, metrics));
    circuitBreakerManager.registerFactory('clickhouse:query', () => new circuit_breaker_adapter_1.CircuitBreakerAdapter('clickhouse:query', defaultConfig, metrics));
    // ===== HEALTH CHECK SERVICE (Phase 9) =====
    const healthCheckService = new health_check_service_1.HealthCheckService(circuitBreakerManager, clickhouseClient);
    // Resume storage
    const resumeStorage = new adapters_1.ResumeStateRedisClickHouseAdapter(shared_1.redisClient, clickhouseClient);
    // HTTP Client
    const httpClient = new http_client_1.FTMHttpClient(proxyAgent, undefined, resumeStorage);
    const repository = new clickhouse_repository_1.ClickHouseRepository(clickhouseClient);
    // Batch processing
    const batchConfig = new batch_config_vo_1.BatchConfig();
    const batchProcessor = new clickhouse_batch_adapter_1.ClickHouseBatchAdapter(clickhouseClient, metrics);
    // Incremental updates
    const syncStateStorage = new clickhouse_sync_state_adapter_1.ClickHouseSyncStateAdapter(clickhouseClient);
    const incrementalBuilder = new clickhouse_incremental_adapter_1.ClickHouseIncrementalAdapter(clickhouseClient, batchProcessor, syncStateStorage);
    const identityMapping = new identity_mapping_service_1.IdentityMappingService(clickhouseClient, batchProcessor, batchConfig, incrementalBuilder, circuitBreakerManager);
    const denormalizedRelationsRepo = new denormalized_relations_repository_1.DenormalizedRelationsRepository(clickhouseClient);
    const denormalization = new denormalization_service_1.DenormalizationService(denormalizedRelationsRepo);
    const parser = new entity_parser_service_1.EntityParserService();
    const sanctionParser = new sanction_parser_service_1.SanctionParserService();
    const progressReporter = progress_reporter_1.ProgressReporterFactory.create(shared_1.redisClient);
    // Staging + Transform layer
    const stagingStorage = new clickhouse_staging_adapter_1.ClickHouseStagingAdapter(clickhouseClient);
    const identityResolver = new clickhouse_identity_resolver_adapter_1.ClickHouseIdentityResolverAdapter(clickhouseClient);
    const transformService = new staging_transform_service_1.StagingTransformService(identityResolver);
    const mvInsert = new mv_insert_adapter_1.MVInsertAdapter(clickhouseClient);
    const stagingSync = new staging_sync_service_1.StagingSyncService(stagingStorage, transformService, mvInsert);
    // External Enrichment (optional)
    let enrichment;
    if (process.env.DADATA_API_KEY) {
        const dadata = new dadata_adapter_1.DaDataAdapter(process.env.DADATA_API_KEY, parseInt(process.env.DADATA_REQUEST_TIMEOUT || '5000'));
        const fuzzy = new fuzzy_matcher_service_1.FuzzyMatcherService();
        const unmappedInnsRepo = new unmapped_inns_repository_1.UnmappedInnsRepository(clickhouseClient);
        const personLookupRepo = new person_lookup_repository_1.PersonLookupRepository(clickhouseClient);
        const mappingRepo = new enrichment_mapping_repository_1.EnrichmentMappingRepository(clickhouseClient);
        const enrichmentBatchProcessor = new enrichment_batch_processor_service_1.EnrichmentBatchProcessor(dadata, fuzzy, personLookupRepo, mappingRepo);
        enrichment = new external_enrichment_service_1.ExternalEnrichmentService(unmappedInnsRepo, enrichmentBatchProcessor, progressReporter);
        const enrichmentWorker = workers_1.EnrichmentWorkerFactory.create(enrichment, progressReporter);
        enrichmentWorker.start();
        console.log('External enrichment enabled with DaData API (background worker started)');
    }
    else {
        console.log('External enrichment disabled (no DADATA_API_KEY)');
    }
    console.log('HTTP Range resume support enabled');
    // Sync services
    const egrulSyncService = new egrul_sync_service_1.EgrulSyncService(httpClient, repository, parser, stagingStorage, stagingSync, syncStateStorage, progressReporter, identityMapping, denormalization, enrichment, resumeStorage);
    const sanctionsOnlyService = new sanctions_only_service_1.SanctionsOnlyService(repository, sanctionParser, httpClient);
    // Graceful Shutdown
    const gracefulShutdownService = new graceful_shutdown_service_1.GracefulShutdownService(async () => {
        const saved = await (0, shutdown_handlers_1.saveActiveOperationsProgress)();
        console.log(`[Shutdown] Saved progress for ${saved} operation(s)`);
        return saved;
    }, async () => {
        await Promise.all([
            shared_1.redisClient.quit().catch(err => console.error('[Shutdown] Redis quit error:', err)),
            shared_1.redisSub.quit().catch(err => console.error('[Shutdown] RedisSub quit error:', err)),
            clickhouseClient.close().catch(err => console.error('[Shutdown] ClickHouse close error:', err))
        ]);
    });
    return {
        clickhouseClient,
        httpClient,
        repository,
        batchProcessor,
        identityMapping,
        denormalizedRelationsRepo,
        denormalization,
        parser,
        sanctionParser,
        progressReporter,
        enrichment,
        egrulSyncService,
        sanctionsOnlyService,
        gracefulShutdownService,
        circuitBreakerManager,
        healthCheckService
    };
}
