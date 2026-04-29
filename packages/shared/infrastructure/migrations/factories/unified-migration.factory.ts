/**
 * Unified Migration Factory
 *
 * @remarks
 * v2.1: Обновлён для архитектуры Discoverer + Applier
 * Factory для создания компонентов миграций.
 * Следует SRP: ответственен только за создание.
 * Следует DIP: возвращает абстракции (порты).
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type Redis from 'ioredis';
import type { IMigrationOrchestrator } from '../ports';
import { UnifiedMigrationAdapter } from '../adapters';
import {
  UnifiedMigrationService,
  MigrationDiscovererService,
  MigrationApplierService
} from '../domain/services';
import { MigrationMetadataParser } from '../domain/services/parsers';
import { ClickHouseMigrationAdapter } from '../adapters';
import { createMigrationLock } from '../../migration-lock.adapter';
import { createCircuitBreakerForClickHouse } from '../../circuit-breaker/factories/circuit-breaker.factory';
import { MigrationParserFactory } from '../infrastructure/factories';

/**
 * Параметры для создания миграционного сервиса
 */
export interface UnifiedMigrationFactoryParams {
  /** ClickHouse клиент */
  readonly clickhouseClient: ClickHouseClient;

  /** Redis клиент (для distributed lock) */
  readonly redisClient: Redis;

  /** Базовая директория с SQL файлами миграций */
  readonly migrationsBaseDir: string;
}

/**
 * Создаёт Unified Migration Orchestrator
 *
 * @param params - Параметры для создания
 * @returns IMigrationOrchestrator
 *
 * @remarks
 * Factory method для создания полного стека миграций (v2.1):
 * - ClickHouseMigrationAdapter (выполнение SQL)
 * - MigrationMetadataParser (парсинг metadata)
 * - MigrationDiscovererService (обнаружение)
 * - MigrationApplierService (применение)
 * - UnifiedMigrationService (координация)
 * - MigrationLock (distributed lock)
 * - CircuitBreaker (fault tolerance)
 * - UnifiedMigrationAdapter (оркестрация)
 */
export function createUnifiedMigrationOrchestrator(
  params: UnifiedMigrationFactoryParams
): IMigrationOrchestrator {
  // Infrastructure Layer
  const migrationRunner = new ClickHouseMigrationAdapter(params.clickhouseClient);

  // Domain Layer - Parser
  const parserFactory = new MigrationParserFactory();
  const metadataParser = new MigrationMetadataParser({
    strategies: parserFactory.createAll()
  });

  // Domain Layer - Discoverer
  const discoverer = new MigrationDiscovererService(
    metadataParser,
    params.migrationsBaseDir
  );

  // Domain Layer - Applier
  const applier = new MigrationApplierService(
    migrationRunner,
    params.migrationsBaseDir
  );

  // Domain Layer - Orchestrator
  const migrationService = new UnifiedMigrationService({
    discoverer,
    applier
  });

  // Infrastructure Layer - Cross-cutting concerns
  const lock = createMigrationLock(params.redisClient);
  const breaker = createCircuitBreakerForClickHouse('migration');

  // Infrastructure Layer - Orchestrator Adapter
  return new UnifiedMigrationAdapter(migrationService, lock, breaker, migrationRunner);
}

/**
 * Создаёт ClickHouse Migration Adapter
 *
 * @param clickhouseClient - ClickHouse клиент
 * @returns ClickHouseMigrationAdapter
 *
 * @remarks
 * Factory method для создания адаптера выполнения миграций.
 */
export function createClickHouseMigrationAdapter(
  clickhouseClient: ClickHouseClient
): ClickHouseMigrationAdapter {
  return new ClickHouseMigrationAdapter(clickhouseClient);
}

/**
 * Создаёт Unified Migration Service (v2.1)
 *
 * @param params - Параметры для создания
 * @returns UnifiedMigrationService
 *
 * @remarks
 * Factory method для создания сервиса координации миграций.
 */
export function createUnifiedMigrationService(
  params: Omit<UnifiedMigrationFactoryParams, 'redisClient'>
): { service: UnifiedMigrationService; runner: ClickHouseMigrationAdapter } {
  const runner = new ClickHouseMigrationAdapter(params.clickhouseClient);

  const parserFactory = new MigrationParserFactory();
  const metadataParser = new MigrationMetadataParser({
    strategies: parserFactory.createAll()
  });

  const discoverer = new MigrationDiscovererService(
    metadataParser,
    params.migrationsBaseDir
  );

  const applier = new MigrationApplierService(
    runner,
    params.migrationsBaseDir
  );

  const service = new UnifiedMigrationService({
    discoverer,
    applier
  });

  return { service, runner };
}
