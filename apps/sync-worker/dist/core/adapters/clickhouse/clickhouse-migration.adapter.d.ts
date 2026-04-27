/**
 * Адаптер для выполнения миграций ClickHouse
 *
 * @remarks
 * Реализует IMigrationRunner порт с помощью ClickHouse клиента.
 * Хранит историю миграций в таблице schema_migrations.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IMigrationRunner, MigrationResult, MigrationOptions } from '../../ports';
/**
 * Адаптер для выполнения миграций ClickHouse
 */
export declare class ClickHouseMigrationAdapter implements IMigrationRunner {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Применяет SQL миграцию
     */
    apply(sql: string, options: MigrationOptions): Promise<MigrationResult>;
    /**
     * Проверяет была ли уже применена миграция
     */
    isApplied(version: string): Promise<boolean>;
    /**
     * Убеждается что таблица миграций существует
     */
    private ensureMigrationsTable;
    /**
     * Регистрирует миграцию как применённую
     */
    private recordMigration;
}
