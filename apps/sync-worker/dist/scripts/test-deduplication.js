"use strict";
/**
 * Скрипт для проверки дедупликации financial_reports
 *
 * @remarks
 * Запуск: npx ts-node src/scripts/test-deduplication.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@clickhouse/client");
const fs_1 = require("fs");
const path_1 = require("path");
const client = (0, client_1.createClient)({
    url: process.env.CLICKHOUSE_URL || 'http://localhost:8123'
});
/**
 * Применяет миграцию
 */
async function applyMigration() {
    console.log('--- APPLYING MIGRATION ---');
    const migrationPath = (0, path_1.join)(__dirname, '../../core/infrastructure/migrations/001_financial_reports_replacingmerge.sql');
    const sql = (0, fs_1.readFileSync)(migrationPath, 'utf-8');
    await client.command({ query: sql });
    console.log('Migration applied');
}
/**
 * Проверяет структуру таблицы
 */
async function verifyTableStructure() {
    console.log('\n--- VERIFYING TABLE STRUCTURE ---');
    const result = await client.query({
        query: `
      SELECT engine, order_by_key
      FROM system.tables
      WHERE database = currentDatabase()
      AND name = 'financial_reports'
    `,
        format: 'JSONEachRow'
    });
    const rows = await result.json();
    if (rows.length === 0) {
        console.error('Table financial_reports not found');
        process.exit(1);
    }
    const table = rows[0];
    console.log(`Engine: ${table.engine}`);
    console.log(`Order Key: ${table.order_by_key}`);
    if (table.engine !== 'ReplacingMergeTree') {
        console.error(`ERROR: Expected ReplacingMergeTree, got ${table.engine}`);
        process.exit(1);
    }
    console.log('✓ Table structure is correct');
}
/**
 * Тестирует дедупликацию
 */
async function testDeduplication() {
    console.log('\n--- TESTING DEDUPLICATION ---');
    const testData = [
        { inn: '1234567890', year: 2023, PL_revenue: 1000000, PL_net_profit: 100000 },
        { inn: '0987654321', year: 2023, PL_revenue: 2000000, PL_net_profit: 200000 },
        { inn: '1111111111', year: 2024, PL_revenue: 3000000, PL_net_profit: 300000 }
    ];
    // Очищаем таблицу перед тестом
    await client.command({
        query: 'TRUNCATE TABLE financial_reports'
    });
    // Первая вставка
    console.log('Inserting test data (first time)...');
    await client.insert({
        table: 'financial_reports',
        values: testData,
        format: 'JSONEachRow'
    });
    // Считаем количество
    const count1Result = await client.query({
        query: 'SELECT count() FINAL as cnt FROM financial_reports WHERE year = 2023',
        format: 'JSONEachRow'
    });
    const count1Rows = await count1Result.json();
    const count1 = count1Rows[0]?.cnt;
    console.log(`Count after first insert: ${count1}`);
    // Вторая вставка тех же данных
    console.log('Inserting test data (second time)...');
    await client.insert({
        table: 'financial_reports',
        values: testData,
        format: 'JSONEachRow'
    });
    // Считаем количество
    const count2Result = await client.query({
        query: 'SELECT count() FINAL as cnt FROM financial_reports WHERE year = 2023',
        format: 'JSONEachRow'
    });
    const count2Rows = await count2Result.json();
    const count2 = count2Rows[0]?.cnt;
    console.log(`Count after second insert: ${count2}`);
    // Проверяем дедупликацию
    if (count1 === count2 && parseInt(count1) === 2) {
        console.log('✓ Deduplication works correctly');
    }
    else {
        console.error(`ERROR: Deduplication failed. Expected 2, got ${count2}`);
        process.exit(1);
    }
    // Проверяем updated_at
    const updatedResult = await client.query({
        query: `
      SELECT updated_at
      FROM financial_reports FINAL
      WHERE inn = '1234567890' AND year = 2023
      LIMIT 1
    `,
        format: 'JSONEachRow'
    });
    const updatedRows = await updatedResult.json();
    if (updatedRows[0]?.updated_at) {
        console.log(`✓ updated_at exists: ${updatedRows[0].updated_at}`);
    }
    else {
        console.error('ERROR: updated_at not found');
        process.exit(1);
    }
}
/**
 * Тестирует обновление данных
 */
async function testDataUpdate() {
    console.log('\n--- TESTING DATA UPDATE ---');
    const updatedData = [
        { inn: '1234567890', year: 2023, PL_revenue: 1500000, PL_net_profit: 150000 }
    ];
    // Вставляем обновлённые данные
    console.log('Inserting updated data...');
    await client.insert({
        table: 'financial_reports',
        values: updatedData,
        format: 'JSONEachRow'
    });
    // Принудительно применяем дедупликацию
    console.log('Running OPTIMIZE TABLE FINAL...');
    await client.command({
        query: 'OPTIMIZE TABLE financial_reports FINAL'
    });
    // Проверяем что данные обновились
    const result = await client.query({
        query: `
      SELECT PL_revenue, PL_net_profit
      FROM financial_reports FINAL
      WHERE inn = '1234567890' AND year = 2023
    `,
        format: 'JSONEachRow'
    });
    const rows = await result.json();
    const revenue = rows[0]?.PL_revenue;
    const profit = rows[0]?.PL_net_profit;
    console.log(`Revenue: ${revenue}, Profit: ${profit}`);
    if (revenue === 1500000 && profit === 150000) {
        console.log('✓ Data update works correctly');
    }
    else {
        console.error(`ERROR: Expected 1500000/150000, got ${revenue}/${profit}`);
        process.exit(1);
    }
}
/**
 * Главная функция
 */
async function main() {
    try {
        await applyMigration();
        await verifyTableStructure();
        await testDeduplication();
        await testDataUpdate();
        console.log('\n--- ALL TESTS PASSED ✓ ---');
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
