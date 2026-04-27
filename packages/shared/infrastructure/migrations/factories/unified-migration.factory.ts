/**
 * Unified Migration Factory
 *
 * @remarks
 * Factory для создания компонентов миграций.
 * Следует SRP: ответственен только за создание.
 * Следует DIP: возвращает абстракции (порты).
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type Redis from 'ioredis';
import type { IMigrationOrchestrator } from '../ports';
import { UnifiedMigrationAdapter } from '../adapters';
import { UnifiedMigrationService } from '../domain/services';
import { ClickHouseMigrationAdapter } from '../adapters';
import { createMigrationLock } from '../../migration-lock.adapter';
import { createCircuitBreakerForClickHouse } from '../../circuit-breaker/factories/circuit-breaker.factory';

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
 * Factory method для создания полного стека миграций:
 * - ClickHouseMigrationAdapter (выполнение SQL)
 * - UnifiedMigrationService (координация)
 * - MigrationLock (distributed lock)
 * - CircuitBreaker (fault tolerance)
 * - UnifiedMigrationAdapter (оркестрация)
 */
export function createUnifiedMigrationOrchestrator(
  params: UnifiedMigrationFactoryParams
): IMigrationOrchestrator {
  // Создаём адаптер для выполнения миграций
  const migrationRunner = new ClickHouseMigrationAdapter(params.clickhouseClient);

  // Создаём сервис для координации миграций
  const migrationService = new UnifiedMigrationService({
    migrationRunner,
    migrationsBaseDir: params.migrationsBaseDir
  });

  // Создаём distributed lock
  const lock = createMigrationLock(params.redisClient);

  // Создаём circuit breaker
  const breaker = createCircuitBreakerForClickHouse('migration');

  // Создаём адаптер оркестрации
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
 * Используется для тестирования или специфичных случаев.
 */
export function createClickHouseMigrationAdapter(
  clickhouseClient: ClickHouseClient
): ClickHouseMigrationAdapter {
  return new ClickHouseMigrationAdapter(clickhouseClient);
}

/**
 * Создаёт Unified Migration Service
 *
 * @param params - Параметры для создания
 * @returns UnifiedMigrationService
 *
 * @remarks
 * Factory method для создания сервиса координации миграций.
 * Используется для тестирования или специфичных случаев.
 */
export function createUnifiedMigrationService(
  params: Omit<UnifiedMigrationFactoryParams, 'redisClient'>
): { service: UnifiedMigrationService; runner: ClickHouseMigrationAdapter } {
  const runner = new ClickHouseMigrationAdapter(params.clickhouseClient);

  const service = new UnifiedMigrationService({
    migrationRunner: runner,
    migrationsBaseDir: params.migrationsBaseDir
  });

  return { service, runner };
}
