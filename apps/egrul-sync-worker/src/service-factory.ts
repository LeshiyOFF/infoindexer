/**
 * Service Factory
 *
 * @remarks
 * Creates and initializes all application services.
 * Keeps main index.ts small and focused.
 */
import type { SocksProxyAgent } from 'socks-proxy-agent';
import type { AppState } from './app-state';
import type { ClickHouseClient } from '@clickhouse/client';
import type { IMetricsCollectorPort } from './core/ports/i-metrics-collector.port';
import { redisClient, redisSub } from 'shared';
import { ResumeStateRedisClickHouseAdapter } from './core/adapters';
import { FTMHttpClient } from './core/infrastructure/http-client';
import { ClickHouseRepository } from './core/repositories/clickhouse.repository';
import { ClickHouseBatchAdapter } from './core/repositories/adapters/clickhouse-batch.adapter';
import { ClickHouseIncrementalAdapter } from './core/repositories/adapters/clickhouse-incremental.adapter';
import { ClickHouseSyncStateAdapter } from './core/repositories/adapters/clickhouse-sync-state.adapter';
import { BatchConfig } from './core/domain/value-objects/batch-config.vo';
import { IdentityMappingService } from './core/repositories/identity-mapping.service';
import { EntityParserService } from './core/entity-parser.service';
import { SanctionParserService } from './core/parsers/sanction-parser.service';
import { ProgressReporterFactory } from './core/infrastructure/progress-reporter';
import { ExternalEnrichmentService } from './core/services/external-enrichment.service';
import { StagingSyncService } from './core/services/staging-sync.service';
import { EgrulTransformService } from './core/services/egrul-transform.service';
import { ClickHouseStagingAdapter } from './core/infrastructure/adapters/clickhouse-staging.adapter';
import { MVInsertAdapter } from './core/infrastructure/adapters/mv-insert.adapter';
import { DaDataAdapter } from './core/adapters/dadata-adapter';
import { FuzzyMatcherService } from './core/services/fuzzy-matcher.service';
import { EnrichmentBatchProcessor } from './core/services/enrichment-batch-processor.service';
import { UnmappedInnsRepository } from './core/repositories/unmapped-inns.repository';
import { PersonLookupRepository } from './core/repositories/person-lookup.repository';
import { EnrichmentMappingRepository } from './core/repositories/enrichment-mapping.repository';
import { EnrichmentWorkerFactory } from './core/workers';
import { EgrulSyncService } from './core/egrul-sync.service';
import { SanctionsOnlyService } from './core/sanctions-only.service';
import { GracefulShutdownService } from './core/domain/graceful-shutdown.service';
import type { IGracefulShutdown } from './core/ports';
import { ConsoleMetricsAdapter } from './core/infrastructure/adapters/console-metrics.adapter';
import { NullMetricsAdapter } from './core/infrastructure/adapters/null-metrics.adapter';
import { ClickHouseMetricsService } from './core/infrastructure/clickhouse-metrics.service';
import { saveActiveOperationsProgress } from './shutdown-handlers';
import { CircuitBreakerManager } from './core/domain/circuit-breaker-manager.service';
import { HealthCheckService } from './core/domain/health-check.service';
import { CircuitBreakerAdapter } from './core/infrastructure/adapters/circuit-breaker.adapter';
import { CircuitBreakerConfigFactory } from './core/domain/factories/circuit-breaker-config.factory';
import { ConsoleLoggerAdapter } from './core/infrastructure/adapters/console-logger.adapter';

/**
 * Initialize all application services
 */
export async function initializeServices(
  clickhouseClient: ClickHouseClient,
  proxyAgent: SocksProxyAgent | null
): Promise<AppState> {
  // ===== METRICS (Phase 7) =====
  // Создаём коллектор метрик на основе ENV переменной
  const enableMetrics = process.env.ENABLE_METRICS === 'true';
  const metrics: IMetricsCollectorPort = enableMetrics
    ? new ConsoleMetricsAdapter()
    : new NullMetricsAdapter();

  const clickhouseMetrics = new ClickHouseMetricsService(metrics);

  if (enableMetrics) {
    console.log('Metrics collection enabled (Console adapter)');
  } else {
    console.log('Metrics collection disabled (Null adapter)');
  }

  // ===== CIRCUIT BREAKER MANAGER (Phase 9) =====
  const circuitBreakerManager = new CircuitBreakerManager();

  // Регистрируем named circuit breakers для ClickHouse операций
  const defaultConfig = CircuitBreakerConfigFactory.default();

  circuitBreakerManager.registerFactory(
    'identity:persons',
    () => new CircuitBreakerAdapter('identity:persons', defaultConfig, metrics)
  );

  circuitBreakerManager.registerFactory(
    'identity:companies',
    () => new CircuitBreakerAdapter('identity:companies', defaultConfig, metrics)
  );

  circuitBreakerManager.registerFactory(
    'identity:inn',
    () => new CircuitBreakerAdapter('identity:inn', defaultConfig, metrics)
  );

  circuitBreakerManager.registerFactory(
    'clickhouse:query',
    () => new CircuitBreakerAdapter('clickhouse:query', defaultConfig, metrics)
  );

  // ===== HEALTH CHECK SERVICE (Phase 9) =====
  const healthCheckService = new HealthCheckService(circuitBreakerManager, clickhouseClient);

  // Resume storage
  const resumeStorage = new ResumeStateRedisClickHouseAdapter(redisClient, clickhouseClient);

  // HTTP Client
  const httpClient = new FTMHttpClient(proxyAgent, undefined, resumeStorage);
  const repository = new ClickHouseRepository(clickhouseClient);

  // Batch processing
  const batchConfig = new BatchConfig();
  const batchProcessor = new ClickHouseBatchAdapter(clickhouseClient, metrics);

  // Incremental updates
  const syncStateStorage = new ClickHouseSyncStateAdapter(clickhouseClient);
  const incrementalBuilder = new ClickHouseIncrementalAdapter(
    clickhouseClient,
    batchProcessor,
    syncStateStorage
  );

  const identityMapping = new IdentityMappingService(
    clickhouseClient,
    batchProcessor,
    batchConfig,
    incrementalBuilder,
    circuitBreakerManager
  );

  const parser = new EntityParserService();
  const sanctionParser = new SanctionParserService();
  const progressReporter = ProgressReporterFactory.create(redisClient);

  // Staging + Transform layer
  const stagingStorage = new ClickHouseStagingAdapter(clickhouseClient);
  const transformService = new EgrulTransformService(
    clickhouseClient,
    stagingStorage,
    enableMetrics ? metrics : undefined
  );
  const stagingSync = new StagingSyncService(stagingStorage);

  // External Enrichment (optional)
  let enrichment: import('./core/services/external-enrichment.service').ExternalEnrichmentService | undefined;

  if (process.env.DADATA_API_KEY) {
    const dadata = new DaDataAdapter(
      process.env.DADATA_API_KEY,
      parseInt(process.env.DADATA_REQUEST_TIMEOUT || '5000')
    );
    const fuzzy = new FuzzyMatcherService();

    const unmappedInnsRepo = new UnmappedInnsRepository(clickhouseClient);
    const personLookupRepo = new PersonLookupRepository(clickhouseClient);
    const mappingRepo = new EnrichmentMappingRepository(clickhouseClient);
    const enrichmentBatchProcessor = new EnrichmentBatchProcessor(dadata, fuzzy, personLookupRepo, mappingRepo);
    enrichment = new ExternalEnrichmentService(unmappedInnsRepo, enrichmentBatchProcessor, progressReporter);

    const enrichmentWorker = EnrichmentWorkerFactory.create(enrichment, progressReporter);
    enrichmentWorker.start();

    console.log('External enrichment enabled with DaData API (background worker started)');
  } else {
    console.log('External enrichment disabled (no DADATA_API_KEY)');
  }

  console.log('HTTP Range resume support enabled');

  // Sync services
  const egrulSyncService = new EgrulSyncService(
    httpClient,
    repository,
    parser,
    stagingStorage,
    stagingSync,
    syncStateStorage,
    progressReporter,
    identityMapping,
    transformService,
    enrichment,
    resumeStorage
  );

  const sanctionsOnlyService = new SanctionsOnlyService(
    repository,
    sanctionParser,
    httpClient
  );

  // Graceful Shutdown
  const gracefulShutdownService: IGracefulShutdown = new GracefulShutdownService(
    async () => {
      const saved = await saveActiveOperationsProgress();
      console.log(`[Shutdown] Saved progress for ${saved} operation(s)`);
      return saved;
    },
    async () => {
      const { stopRedisSubscriptions } = await import('./redis-handlers');
      await stopRedisSubscriptions().catch((err: unknown) => console.error('[Shutdown] Redis subscriptions stop error:', err));

      await Promise.all([
        redisClient.quit().catch((err: unknown) => console.error('[Shutdown] Redis quit error:', err)),
        redisSub.quit().catch((err: unknown) => console.error('[Shutdown] RedisSub quit error:', err)),
        clickhouseClient.close().catch((err: unknown) => console.error('[Shutdown] ClickHouse close error:', err))
      ]);
    }
  );

  return {
    clickhouseClient,
    httpClient,
    repository,
    batchProcessor,
    identityMapping,
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
