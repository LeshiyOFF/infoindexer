/**
 * Application State Container
 *
 * @remarks
 * Holds all initialized services and dependencies.
 * Used throughout the application lifecycle.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { FTMHttpClient } from './core/infrastructure/http-client';
import type { ClickHouseRepository } from './core/repositories/clickhouse.repository';
import type { ClickHouseBatchAdapter } from './core/repositories/adapters/clickhouse-batch.adapter';
import type { IdentityMappingService } from './core/repositories/identity-mapping.service';
import type { EntityParserService } from './core/entity-parser.service';
import type { SanctionParserService } from './core/parsers/sanction-parser.service';
import type { ProgressReporter } from './core/infrastructure/progress-reporter';
import type { ExternalEnrichmentService } from './core/services/external-enrichment.service';
import type { EgrulSyncService } from './core/egrul-sync.service';
import type { SanctionsOnlyService } from './core/sanctions-only.service';
import type { IGracefulShutdown } from './core/ports';
import type { ICircuitBreakerManagerPort } from './core/ports';
import type { CircuitBreakerManager } from './core/domain/circuit-breaker-manager.service';
import type { HealthCheckService } from './core/domain/health-check.service';

export interface AppState {
  clickhouseClient: ClickHouseClient;
  httpClient: FTMHttpClient;
  repository: ClickHouseRepository;
  batchProcessor: ClickHouseBatchAdapter;
  identityMapping: IdentityMappingService;
  parser: EntityParserService;
  sanctionParser: SanctionParserService;
  progressReporter: ProgressReporter;
  enrichment?: ExternalEnrichmentService;
  egrulSyncService: EgrulSyncService;
  sanctionsOnlyService: SanctionsOnlyService;
  gracefulShutdownService: IGracefulShutdown;
  circuitBreakerManager: CircuitBreakerManager;
  healthCheckService: HealthCheckService;
}

/**
 * Active operation tracker
 */
export interface ActiveOperation {
  readonly controller: AbortController;
  readonly type: 'egrul' | 'sanctions' | 'refresh';
}

let appStateInstance: AppState | null = null;

export function setAppState(state: AppState): void {
  appStateInstance = state;
}

export function getAppState(): AppState | null {
  return appStateInstance;
}

export function clearAppState(): void {
  appStateInstance = null;
}
