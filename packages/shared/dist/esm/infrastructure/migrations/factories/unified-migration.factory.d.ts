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
import { UnifiedMigrationService } from '../domain/services';
import { ClickHouseMigrationAdapter } from '../adapters';
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
export declare function createUnifiedMigrationOrchestrator(params: UnifiedMigrationFactoryParams): IMigrationOrchestrator;
/**
 * Создаёт ClickHouse Migration Adapter
 *
 * @param clickhouseClient - ClickHouse клиент
 * @returns ClickHouseMigrationAdapter
 *
 * @remarks
 * Factory method для создания адаптера выполнения миграций.
 */
export declare function createClickHouseMigrationAdapter(clickhouseClient: ClickHouseClient): ClickHouseMigrationAdapter;
/**
 * Создаёт Unified Migration Service (v2.1)
 *
 * @param params - Параметры для создания
 * @returns UnifiedMigrationService
 *
 * @remarks
 * Factory method для создания сервиса координации миграций.
 */
export declare function createUnifiedMigrationService(params: Omit<UnifiedMigrationFactoryParams, 'redisClient'>): {
    service: UnifiedMigrationService;
    runner: ClickHouseMigrationAdapter;
};
