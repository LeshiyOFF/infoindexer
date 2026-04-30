"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseMigrationAdapter = void 0;
const MIGRATIONS_TABLE = 'schema_migrations';
/**
 * ClickHouse Migration Adapter
 *
 * @remarks
 * Реализует IMigrationRunner порт для ClickHouse.
 * Хранит историю миграций в таблице schema_migrations.
 */
class ClickHouseMigrationAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
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
    async apply(sql, options) {
        const startTime = Date.now();
        if (options.dryRun) {
            console.log(`[DRY RUN] Migration ${options.category}/${options.version}: ${options.description}`);
            return {
                success: true,
                version: options.version,
                durationMs: Date.now() - startTime,
                appliedAt: new Date()
            };
        }
        try {
            // Special case: shared/000 creates schema_migrations table
            // Skip ensureMigrationsTable() for this migration
            const isInitMigration = options.category === 'shared' && options.version === '000';
            if (!isInitMigration) {
                await this.ensureMigrationsTable();
            }
            const isApplied = await this.isApplied(options.category, options.version);
            if (isApplied) {
                console.log(`Migration ${options.category}/${options.version} already applied, skipping`);
                return {
                    success: true,
                    version: options.version,
                    durationMs: Date.now() - startTime
                };
            }
            console.log(`Applying migration ${options.category}/${options.version}: ${options.description}`);
            // Применяем миграцию (поддержка multi-statement)
            const statements = this.splitStatements(sql);
            console.log(`Migration ${options.category}/${options.version}: split into ${statements.length} statements`);
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                console.log(`Statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
                // Ждём завершения DDL операций (CREATE, ALTER, DROP)
                const isDDL = /^(CREATE|ALTER|DROP|TRUNCATE|OPTIMIZE)/i.test(statement);
                await this.client.command({
                    query: statement,
                    clickhouse_settings: isDDL ? { wait_end_of_query: 1 } : undefined
                });
                // Для MATERIALIZED VIEW с POPULATE добавляем задержку
                if (/CREATE\s+MATERIALIZED\s+VIEW/i.test(statement) && /POPULATE/i.test(statement)) {
                    console.log(`Waiting for POPULATE to complete...`);
                    await this.sleep(2000);
                }
            }
            // Регистрируем миграцию
            await this.recordMigration(options.category, options.version, options.description);
            const durationMs = Date.now() - startTime;
            console.log(`Migration ${options.category}/${options.version} applied in ${durationMs}ms`);
            return {
                success: true,
                version: options.version,
                durationMs,
                appliedAt: new Date()
            };
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Migration ${options.category}/${options.version} failed: ${errorMessage}`);
            return {
                success: false,
                version: options.version,
                durationMs,
                error: errorMessage
            };
        }
    }
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
    async isApplied(category, version) {
        try {
            await this.ensureMigrationsTable();
            const result = await this.client.query({
                query: `
          SELECT count() as cnt
          FROM ${MIGRATIONS_TABLE}
          WHERE category = {category:String}
            AND version = {version:String}
        `,
                query_params: { category, version },
                format: 'JSONEachRow'
            });
            const rows = await result.json();
            const count = parseInt(rows[0]?.cnt || '0', 10);
            return count > 0;
        }
        catch {
            return false;
        }
    }
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
    async cleanupDatabase() {
        const dbName = 'default'; // TODO: получать из конфига
        console.warn(`[CLEANUP] Dropping database '${dbName}' — ALL DATA WILL BE LOST!`);
        // DROP DATABASE
        await this.client.command({
            query: `DROP DATABASE IF EXISTS ${dbName}`,
            clickhouse_settings: { wait_end_of_query: 1 }
        });
        console.log(`[CLEANUP] Database '${dbName}' dropped`);
        // CREATE DATABASE
        await this.client.command({
            query: `CREATE DATABASE ${dbName}`,
            clickhouse_settings: { wait_end_of_query: 1 }
        });
        console.log(`[CLEANUP] Database '${dbName}' recreated`);
        // Пересоздаём schema_migrations
        await this.client.command({
            query: `
        CREATE TABLE ${MIGRATIONS_TABLE} (
          category String,
          version String,
          description String,
          applied_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (category, version)
      `,
            clickhouse_settings: { wait_end_of_query: 1 }
        });
        console.log(`[CLEANUP] Table ${MIGRATIONS_TABLE} recreated`);
    }
    /**
     * Убеждается что таблица миграций существует
     *
     * @remarks
     * Проверяет существование таблицы schema_migrations.
     * Таблица должна быть создана миграцией 000.
     */
    async ensureMigrationsTable() {
        const result = await this.client.query({
            query: `
        SELECT count() as cnt
        FROM system.tables
        WHERE database = currentDatabase()
          AND name = {table:String}
      `,
            query_params: { table: MIGRATIONS_TABLE },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        const count = parseInt(rows[0]?.cnt || '0', 10);
        if (count === 0) {
            throw new Error('schema_migrations table not found. Run migration 000 first.');
        }
    }
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
    async recordMigration(category, version, description) {
        await this.client.insert({
            table: MIGRATIONS_TABLE,
            values: [{ category, version, description }],
            format: 'JSONEachRow'
        });
    }
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
    splitStatements(sql) {
        return sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => {
            // Удаляем однострочные комментарии (-- ...)
            return s.replace(/^--.*$/gm, '').trim();
        })
            .filter(s => s.length > 0);
    }
    /**
     * Задержка выполнения (для await)
     *
     * @param ms - Миллисекунды
     * @returns Promise который резолвится после задержки
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.ClickHouseMigrationAdapter = ClickHouseMigrationAdapter;
