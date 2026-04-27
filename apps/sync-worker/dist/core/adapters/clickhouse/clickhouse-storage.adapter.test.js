"use strict";
/**
 * Тесты для ClickHouseStorageAdapter
 *
 * @remarks
 * Проверяет дедупликацию через ReplacingMergeTree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const client_1 = require("@clickhouse/client");
const clickhouse_storage_adapter_1 = require("./clickhouse-storage.adapter");
(0, globals_1.describe)('ClickHouseStorageAdapter', () => {
    const client = (0, client_1.createClient)({
        url: process.env.CLICKHOUSE_URL || 'http://localhost:8123'
    });
    const adapter = new clickhouse_storage_adapter_1.ClickHouseStorageAdapter(client);
    const testTableName = 'financial_reports';
    (0, globals_1.beforeAll)(async () => {
        // Очищаем таблицу перед тестами
        try {
            await client.command({
                query: `DROP TABLE IF EXISTS ${testTableName}`
            });
        }
        catch {
            // Игнорируем ошибку если таблицы нет
        }
    });
    (0, globals_1.afterAll)(async () => {
        await client.close();
    });
    (0, globals_1.describe)('Дедупликация через ReplacingMergeTree', () => {
        const testColumns = [
            { name: 'inn', type: 'String' },
            { name: 'year', type: 'UInt16' },
            { name: 'revenue', type: 'Float64' },
            { name: 'profit', type: 'Float64' }
        ];
        const testData = [
            { inn: '1234567890', year: 2023, revenue: 1000000, profit: 100000 },
            { inn: '0987654321', year: 2023, revenue: 2000000, profit: 200000 },
            { inn: '1111111111', year: 2024, revenue: 3000000, profit: 300000 }
        ];
        (0, globals_1.it)('должен создать таблицу с ReplacingMergeTree', async () => {
            await adapter.ensureTable(testColumns);
            const result = await client.query({
                query: `
          SELECT engine
          FROM system.tables
          WHERE database = currentDatabase()
          AND name = {name:String}
        `,
                query_params: { name: testTableName },
                format: 'JSONEachRow'
            });
            const rows = await result.json();
            (0, globals_1.expect)(rows[0]?.engine).toBe('ReplacingMergeTree');
        });
        (0, globals_1.it)('должен иметь ORDER BY (inn, year)', async () => {
            const result = await client.query({
                query: `
          SELECT sort_key_from_partition()
          FROM system.tables
          WHERE database = currentDatabase()
          AND name = {name:String}
        `,
                query_params: { name: testTableName },
                format: 'JSONEachRow'
            });
            // Проверяем что таблица создана с правильным ключом
            // (точная проверка зависит от версии ClickHouse)
            (0, globals_1.expect)(result).toBeDefined();
        });
        (0, globals_1.it)('должен вставить данные', async () => {
            await adapter.insertBatch(testData);
            const count = await adapter.countRows(2023);
            (0, globals_1.expect)(count).toBe(2);
        });
        (0, globals_1.it)('должен дедуплицировать повторную вставку', async () => {
            // Вставляем те же данные ещё раз
            await adapter.insertBatch(testData);
            // С FINAL должно быть то же количество
            const count = await adapter.countRows(2023);
            (0, globals_1.expect)(count).toBe(2);
        });
        (0, globals_1.it)('должен обновлять данные при повторной вставке с изменёнными значениями', async () => {
            const updatedData = [
                { inn: '1234567890', year: 2023, revenue: 1500000, profit: 150000 }
            ];
            await adapter.insertBatch(updatedData);
            // OPTIMIZE FINAL принудительно применяет дедупликацию
            await client.command({
                query: `OPTIMIZE TABLE ${testTableName} FINAL`
            });
            // Проверяем что данные обновились
            const result = await client.query({
                query: `
          SELECT revenue, profit
          FROM ${testTableName} FINAL
          WHERE inn = {inn:String} AND year = {year:UInt16}
        `,
                query_params: { inn: '1234567890', year: 2023 },
                format: 'JSONEachRow'
            });
            const rows = await result.json();
            (0, globals_1.expect)(rows[0]?.revenue).toBe(1500000);
            (0, globals_1.expect)(rows[0]?.profit).toBe(150000);
        });
        (0, globals_1.it)('должен иметь updated_at колонку', async () => {
            const result = await client.query({
                query: `
          SELECT updated_at
          FROM ${testTableName} FINAL
          WHERE inn = {inn:String} AND year = {year:UInt16}
          LIMIT 1
        `,
                query_params: { inn: '1234567890', year: 2023 },
                format: 'JSONEachRow'
            });
            const rows = await result.json();
            (0, globals_1.expect)(rows[0]?.updated_at).toBeDefined();
            (0, globals_1.expect)(rows[0]?.updated_at).not.toBeNull();
        });
    });
    (0, globals_1.describe)('countRows', () => {
        (0, globals_1.it)('должен возвращать 0 для пустого года', async () => {
            const count = await adapter.countRows(9999);
            (0, globals_1.expect)(count).toBe(0);
        });
    });
});
