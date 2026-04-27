/**
 * Адаптер для выполнения миграций ClickHouse
 *
 * @remarks
 * Реализует IMigrationRunner порт с помощью ClickHouse клиента.
 * Хранит историю миграций в таблице schema_migrations.
 *
 * Следует Dependency Inversion Principle: зависит от абстракции (Port),
 * а не от конкретной реализации деталей.
 *
 * Использует state-based подход: проверяет фактическое состояние БД
 * перед применением миграции, предотвращая schema drift.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IMigrationRunner, MigrationResult, MigrationOptions } from '../ports';
/**
 * Адаптер для выполнения миграций ClickHouse
 *
 * @remarks
 * Отслеживает применённые миграции через таблицу schema_migrations.
 * Обеспечивает идемпотентность — повторное применение безопасно.
 *
 * State-based подход:
 * 1. Проверяет запись в schema_migrations
 * 2. Проверяет фактическое состояние таблицы
 * 3. Применяет миграцию только если таблица отсутствует
 */
export declare class ClickHouseMigrationAdapter implements IMigrationRunner {
    private readonly stateDetector;
    private readonly applier;
    constructor(client: ClickHouseClient);
    /**
     * Применяет SQL миграцию
     *
     * @remarks
     * - Проверяет историю миграций
     * - Проверяет фактическое состояние БД (state detection)
     * - Выполняет SQL только если таблица отсутствует
     * - Регистрирует миграцию в истории
     *
     * @param sql - SQL скрипт миграции
     * @param options - Опции миграции
     * @returns Результат применения
     */
    apply(sql: string, options: MigrationOptions): Promise<MigrationResult>;
    /**
     * Создаёт результат для dry-run режима
     */
    private createDryRunResult;
    /**
     * Создаёт результат для пропущенной миграции
     */
    private createSkipResult;
    /**
     * Применяет миграцию и регистрирует её
     *
     * @remarks
     * Использует MigrationApplierHelper для выполнения SQL.
     */
    private applyMigration;
    /**
     * Создаёт результат ошибки
     */
    private createErrorResult;
    /**
     * Проверяет была ли миграция записана в историю
     *
     * @param version - Версия миграции
     * @returns true если миграция записана
     */
    isApplied(version: string): Promise<boolean>;
    /**
     * Проверяет запись миграции в истории
     *
     * @param version - Версия миграции
     * @returns true если запись существует
     */
    private isRecorded;
    /**
     * Убеждается что таблица миграций существует
     *
     * @remarks
     * Создаёт schema_migrations если она не существует.
     * Использует MergeTree для оптимальной производительности.
     */
    private ensureMigrationsTable;
    /**
     * Проверяет существование таблицы
     *
     * @param tableName - Имя таблицы
     * @returns true если таблица существует
     */
    private tableExists;
    /**
     * Регистрирует миграцию как применённую
     *
     * @param version - Версия миграции
     * @param description - Описание миграции
     */
    private recordMigration;
}
