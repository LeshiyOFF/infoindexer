"use strict";
/**
 * Тесты для ClickHouseMigrationAdapter
 *
 * @remarks
 * Проверяет применение миграций.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const client_1 = require("@clickhouse/client");
const clickhouse_migration_adapter_1 = require("./clickhouse-migration.adapter");
(0, globals_1.describe)('ClickHouseMigrationAdapter', () => {
    const client = (0, client_1.createClient)({
        url: process.env.CLICKHOUSE_URL || 'http://localhost:8123'
    });
    const adapter = new clickhouse_migration_adapter_1.ClickHouseMigrationAdapter(client);
    (0, globals_1.beforeAll)(async () => {
        // Очищаем таблицу миграций перед тестами
        try {
            await client.command({
                query: 'DROP TABLE IF EXISTS schema_migrations'
            });
        }
        catch {
            // Игнорируем ошибку если таблицы нет
        }
    });
    (0, globals_1.afterAll)(async () => {
        await client.close();
    });
    (0, globals_1.describe)('apply', () => {
        (0, globals_1.it)('должен создавать таблицу schema_migrations', async () => {
            const result = await adapter.apply('CREATE TABLE IF NOT EXISTS test_table (id UInt8) ENGINE = MergeTree() ORDER BY id', { version: '001', description: 'Test migration' });
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.version).toBe('001');
            // Проверяем что таблица миграций создана
            const tables = await client.query({
                query: `
          SELECT name
          FROM system.tables
          WHERE database = currentDatabase()
          AND name = {name:String}
        `,
                query_params: { name: 'schema_migrations' },
                format: 'JSONEachRow'
            });
            const rows = await tables.json();
            (0, globals_1.expect)(rows).toHaveLength(1);
            (0, globals_1.expect)(rows[0]?.name).toBe('schema_migrations');
        });
        (0, globals_1.it)('должен записывать миграцию в историю', async () => {
            const isAppliedBefore = await adapter.isApplied('001');
            (0, globals_1.expect)(isAppliedBefore).toBe(true);
            // Повторное применение не должно вызывать ошибку
            const result = await adapter.apply('CREATE TABLE IF NOT EXISTS test_table (id UInt8) ENGINE = MergeTree() ORDER BY id', { version: '001', description: 'Test migration' });
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('должен возвращать ошибку при неверном SQL', async () => {
            const result = await adapter.apply('INVALID SQL QUERY', { version: '002', description: 'Invalid migration' });
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.error).toBeDefined();
        });
        (0, globals_1.it)('dryRun режим не должен применять изменения', async () => {
            const result = await adapter.apply('CREATE TABLE IF NOT EXISTS dry_run_table (id UInt8) ENGINE = MergeTree() ORDER BY id', { version: '003', description: 'Dry run migration', dryRun: true });
            (0, globals_1.expect)(result.success).toBe(true);
            // Миграция не должна быть записана
            const isApplied = await adapter.isApplied('003');
            (0, globals_1.expect)(isApplied).toBe(false);
        });
    });
    (0, globals_1.describe)('isApplied', () => {
        (0, globals_1.it)('должен возвращать false для неприменённой миграции', async () => {
            const isApplied = await adapter.isApplied('999_nonexistent');
            (0, globals_1.expect)(isApplied).toBe(false);
        });
    });
});
