/**
 * Migration Worker App Initializer
 *
 * @remarks
 * Отвечает за инициализацию всех зависимостей migration-worker.
 * Следует SRP: только инициализация.
 * Следует DIP: возвращает абстракции.
 */

import { createClient } from '@clickhouse/client';
import Redis from 'ioredis';
import {
  createUnifiedMigrationOrchestrator,
  createClickHouseMigrationAdapter,
  RedisDistributedLockAdapter
} from 'shared/infrastructure/migrations';
import type {
  IMigrationOrchestrator,
  IMigrationRunner,
  IDistributedLock
} from 'shared/infrastructure/migrations';
import type { ClickHouseClient } from '@clickhouse/client';

/**
 * Dependencies приложения
 *
 * @remarks
 * Value Object с readonly свойствами.
 * Содержит все необходимые зависимости.
 */
export interface AppDependencies {
  /** Орхестратор миграций */
  readonly migrationOrchestrator: IMigrationOrchestrator;

  /** Runner миграций (для cleanup) */
  readonly migrationRunner: IMigrationRunner;

  /** ClickHouse клиент */
  readonly clickhouseClient: ClickHouseClient;

  /** Redis клиент */
  readonly redisClient: Redis;

  /** Distributed lock */
  readonly distributedLock: IDistributedLock;
}

/**
 * Инициализирует приложение
 *
 * @returns Dependencies приложения
 * @throws {Error} если инициализация не удалась
 *
 * @remarks
 * - Создаёт ClickHouse клиент
 * - Создаёт Redis клиент
 * - Создаёт миграционный сервис
 */
export async function initializeApp(): Promise<AppDependencies> {
  const targetDatabase = process.env.CLICKHOUSE_DB || 'infoindexer';

  // Создаём ClickHouse клиент (сначала к default для создания базы)
  const clickhouseClient = createClient({
    url: process.env.CLICKHOUSE_SECURE === 'true'
      ? `https://${process.env.CLICKHOUSE_HOST || 'localhost'}:8443`
      : `http://${process.env.CLICKHOUSE_HOST || 'localhost'}:8123`,
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
    database: 'default',
    request_timeout: 30000,
    compression: {
      response: true,
      request: true
    }
  });

  // Создаём базу данных если не существует
  await clickhouseClient.query({
    query: `CREATE DATABASE IF NOT EXISTS ${targetDatabase}`
  });

  // Переключаемся на целевую базу
  await clickhouseClient.close();
  const dbClient = createClient({
    url: process.env.CLICKHOUSE_SECURE === 'true'
      ? `https://${process.env.CLICKHOUSE_HOST || 'localhost'}:8443`
      : `http://${process.env.CLICKHOUSE_HOST || 'localhost'}:8123`,
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
    database: targetDatabase,
    request_timeout: 30000,
    compression: {
      response: true,
      request: true
    }
  });

  // Создаём Redis клиент
  const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 100, 3000);
    }
  });

  // Создаём distributed lock
  const distributedLock = new RedisDistributedLockAdapter(redisClient);

  // Создаём migration runner (для cleanup и других операций)
  const migrationRunner = createClickHouseMigrationAdapter(dbClient);

  // Путь к директории с миграциями
  const migrationsBaseDir = process.env.MIGRATIONS_BASE_DIR ||
    '/app/packages/shared/infrastructure/migrations/files';

  // Создаём миграционный сервис
  const migrationOrchestrator = createUnifiedMigrationOrchestrator({
    clickhouseClient: dbClient,
    redisClient,
    migrationsBaseDir
  });

  return {
    migrationOrchestrator,
    migrationRunner,
    clickhouseClient: dbClient,
    redisClient,
    distributedLock
  };
}

/**
 * Закрывает соединения
 *
 * @param deps - Dependencies приложения
 *
 * @remarks
 * Закрывает ClickHouse и Redis соединения.
 */
export async function closeConnections(deps: AppDependencies): Promise<void> {
  try {
    await deps.clickhouseClient.close();
  } catch (error) {
    console.error('Error closing ClickHouse connection:', error);
  }

  try {
    await deps.redisClient.quit();
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
}
