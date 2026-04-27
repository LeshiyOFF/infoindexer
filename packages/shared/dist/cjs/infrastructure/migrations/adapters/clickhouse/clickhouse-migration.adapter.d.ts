/**
 * ClickHouse Migration Adapter
 *
 * @remarks
 * Infrastructure Layer: реализует IMigrationRunner порт.
 * Выполняет SQL миграции в ClickHouse с отслеживанием применённых.
 *
 * Следует SRP: ответственен только за выполнение миграций.
 * Следует DIP: реализует IMigrationRunner port.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { MigrationResult, MigrationOptions, IMigrationRunner } from '../../ports';
/**
 * ClickHouse Migration Adapter
 *
 * @remarks
 * Реализует IMigrationRunner порт для ClickHouse.
 * Хранит историю миграций в таблице schema_migrations.
 */
export declare class ClickHouseMigrationAdapter implements IMigrationRunner {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Применяет SQL миграцию
     *
     * @param sql - SQL скрипт миграции
     * @param options - Опции миграции
     * @returns Результат применения
     *
     * @remarks
     * - Проверяет что миграция ещё не применена
     * - Выполняет SQL
     * - Регистрирует миграцию как применённую
     */
    apply(sql: string, options: MigrationOptions): Promise<MigrationResult>;
    /**
     * Проверяет была ли уже применена миграция
     *
     * @param category - Категория миграции
     * @param version - Версия миграции
     * @returns true если миграция уже применена
     *
     * @remarks
     * Запрашивает таблицу schema_migrations по (category, version).
     */
    isApplied(category: string, version: string): Promise<boolean>;
    /**
     * Полностью очищает базу данных (только для dev/testing)
     *
     * @returns Promise<void>
     *
     * @remarks
     * ⚠️ DANGEROUS: Удаляет ВСЕ данные без возможности восстановления!
     *
     * Используется только когда MIGRATION_AUTO_CLEANUP=true.
     * НИКОГДА не использовать в production.
     */
    cleanupDatabase(): Promise<void>;
    /**
     * Убеждается что таблица миграций существует
     *
     * @remarks
     * Проверяет существование таблицы schema_migrations.
     * Таблица должна быть создана миграцией 000.
     */
    private ensureMigrationsTable;
    /**
     * Регистрирует миграцию как применённую
     *
     * @param category - Категория миграции
     * @param version - Версия миграции
     * @param description - Описание миграции
     *
     * @remarks
     * Вставляет запись в schema_migrations с category.
     */
    private recordMigration;
    /**
     * Разбивает SQL на отдельные команды
     *
     * @param sql - SQL скрипт (может содержать несколько команд)
     * @returns Массив отдельных SQL команд
     *
     * @remarks
     * ClickHouse HTTP interface не поддерживает multi-statement запросы.
     * Разбиваем SQL по точке с запятой, удаляя строки-комментарии.
     */
    private splitStatements;
    /**
     * Задержка выполнения (для await)
     *
     * @param ms - Миллисекунды
     * @returns Promise который резолвится после задержки
     */
    private sleep;
}
