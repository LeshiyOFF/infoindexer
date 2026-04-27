/**
 * Migration Worker App Initializer
 *
 * @remarks
 * Отвечает за инициализацию всех зависимостей migration-worker.
 * Следует SRP: только инициализация.
 * Следует DIP: возвращает абстракции.
 */
import Redis from 'ioredis';
import type { IMigrationOrchestrator, IMigrationRunner, IDistributedLock } from 'shared/infrastructure/migrations';
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
export declare function initializeApp(): Promise<AppDependencies>;
/**
 * Закрывает соединения
 *
 * @param deps - Dependencies приложения
 *
 * @remarks
 * Закрывает ClickHouse и Redis соединения.
 */
export declare function closeConnections(deps: AppDependencies): Promise<void>;
