"use strict";
/**
 * Скрипт для проверки Partition настроек
 *
 * @remarks
 * Запуск: npx ts-node src/scripts/test-partitioning.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@clickhouse/client");
const client = (0, client_1.createClient)({
    url: process.env.CLICKHOUSE_URL || 'http://localhost:8123'
});
/**
 * Проверяет partition для таблицы
 */
async function checkTablePartition(tableName) {
    // Получаем информацию о партициях
    const partsResult = await client.query({
        query: `
      SELECT
        partition,
        name,
        rows,
        bytes_on_disk
      FROM system.parts
      WHERE table = {table:String}
      AND active = 1
      ORDER BY partition
    `,
        query_params: { table: tableName },
        format: 'JSONEachRow'
    });
    const parts = await partsResult.json();
    if (parts.length === 0) {
        console.error(`❌ ${tableName}: No partitions found`);
        return;
    }
    // Группируем по partition
    const partitionMap = new Map();
    for (const part of parts) {
        const existing = partitionMap.get(part.partition) || { rows: 0, bytes: 0 };
        partitionMap.set(part.partition, {
            rows: existing.rows + part.rows,
            bytes: existing.bytes + part.bytes_on_disk
        });
    }
    console.log(`✓ ${tableName}:`);
    for (const [partition, info] of partitionMap.entries()) {
        const mb = (info.bytes / 1024 / 1024).toFixed(2);
        console.log(`  Partition ${partition}: ${info.rows.toLocaleString()} rows, ${mb} MB`);
    }
    // Проверяем partition key из CREATE TABLE
    const createResult = await client.query({
        query: `
      SELECT create_table_query
      FROM system.tables
      WHERE database = currentDatabase()
      AND name = {table:String}
    `,
        query_params: { table: tableName },
        format: 'JSONEachRow'
    });
    const createRows = await createResult.json();
    if (createRows.length > 0) {
        const createQuery = createRows[0].create_table_query;
        const partitionMatch = createQuery.match(/PARTITION BY ([^\s\n]+)/);
        if (partitionMatch) {
            console.log(`  Partition key: ${partitionMatch[1]}`);
        }
        else {
            console.log(`  Partition key: NOT SET`);
        }
    }
}
/**
 * Проверяет все таблицы
 */
async function checkAllTables() {
    console.log('--- CHECKING PARTITION SETTINGS ---\n');
    const tables = [
        'financial_reports',
        'financial_reports_summary'
    ];
    for (const table of tables) {
        try {
            await checkTablePartition(table);
        }
        catch (error) {
            console.error(`❌ ${table}: ${error}`);
        }
    }
}
/**
 * Тестирует DROP PARTITION на тестовой таблице
 */
async function testDropPartition() {
    console.log('\n--- TESTING DROP PARTITION ---');
    const testTable = 'test_partitioning';
    const currentYear = new Date().getFullYear();
    const testPartition = `${currentYear}01`;
    try {
        // Создаём тестовую таблицу
        await client.command({
            query: `
        CREATE TABLE IF NOT EXISTS ${testTable} (
          id String,
          year UInt16,
          value Float64,
          updated_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (id, year)
        PARTITION BY toYYYYMM(makeDate(year, 1, 1))
      `
        });
        // Вставляем тестовые данные
        await client.command({
            query: `
        INSERT INTO ${testTable} (id, year, value)
        VALUES
          ('1', ${currentYear}, 100.0),
          ('2', ${currentYear}, 200.0),
          ('3', ${currentYear - 1}, 300.0)
      `
        });
        // Считаем количество строк до
        const beforeResult = await client.query({
            query: `SELECT count() as cnt FROM ${testTable}`,
            format: 'JSONEachRow'
        });
        const beforeRows = await beforeResult.json();
        console.log(`  Before DROP: ${beforeRows[0]?.cnt} rows`);
        // Замеряем время DROP PARTITION
        const start = Date.now();
        await client.command({
            query: `ALTER TABLE ${testTable} DROP PARTITION ${testPartition}`
        });
        const elapsed = Date.now() - start;
        // Считаем количество строк после
        const afterResult = await client.query({
            query: `SELECT count() as cnt FROM ${testTable}`,
            format: 'JSONEachRow'
        });
        const afterRows = await afterResult.json();
        console.log(`  After DROP:  ${afterRows[0]?.cnt} rows`);
        console.log(`  DROP PARTITION took: ${elapsed}ms`);
        if (elapsed < 1000) {
            console.log(`  ✅ DROP PARTITION < 1 second`);
        }
        else {
            console.log(`  ⚠️  DROP PARTITION took ${elapsed}ms (expected < 1000ms)`);
        }
    }
    finally {
        // Удаляем тестовую таблицу
        await client.command({ query: `DROP TABLE IF EXISTS ${testTable}` });
    }
}
/**
 * Главная функция
 */
async function main() {
    try {
        await checkAllTables();
        await testDropPartition();
        console.log('\n--- PARTITION VERIFICATION COMPLETE ---');
        console.log('\nExpected partition keys:');
        console.log('  - financial_reports: PARTITION BY toYYYYMM(makeDate(year, 1, 1))');
        console.log('  - financial_reports_summary: PARTITION BY toYYYYMM(makeDate(latest_year, 1, 1))');
    }
    catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
    finally {
        await client.close();
    }
}
main();
