"use strict";
/**
 * Скрипт для проверки TTL настроек
 *
 * @remarks
 * Запуск: npx ts-node src/scripts/test-ttl.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@clickhouse/client");
const client = (0, client_1.createClient)({
    url: process.env.CLICKHOUSE_URL || 'http://localhost:8123'
});
/**
 * Проверяет TTL для таблицы
 */
async function checkTableTtl(tableName) {
    const result = await client.query({
        query: `
      SELECT
        table,
        ttl_expression,
        max_table_partition_ttl as max_ttl_date
      FROM system.ttl_tables
      WHERE database = currentDatabase()
      AND table = {table:String}
    `,
        query_params: { table: tableName },
        format: 'JSONEachRow'
    });
    const rows = await result.json();
    if (rows.length === 0) {
        console.error(`❌ ${tableName}: TTL not found`);
        return;
    }
    const ttl = rows[0];
    console.log(`✓ ${tableName}:`);
    console.log(`  Expression: ${ttl.ttl_expression}`);
    console.log(`  Max TTL date: ${ttl.max_ttl_date}`);
}
/**
 * Проверяет все таблицы
 */
async function checkAllTables() {
    console.log('--- CHECKING TTL SETTINGS ---\n');
    const tables = [
        'financial_reports',
        'financial_reports_summary',
        'companies_meta',
        'company_sanctions',
        'egrul_identity_mapping'
    ];
    for (const table of tables) {
        try {
            await checkTableTtl(table);
        }
        catch (error) {
            console.error(`❌ ${table}: ${error}`);
        }
    }
}
/**
 * Главная функция
 */
async function main() {
    try {
        await checkAllTables();
        console.log('\n--- TTL VERIFICATION COMPLETE ---');
        console.log('\nExpected TTL values:');
        console.log('  - financial_reports: 10 years');
        console.log('  - financial_reports_summary: 5 years');
        console.log('  - companies_meta: 5 years');
        console.log('  - company_sanctions: 5 years');
        console.log('  - egrul_identity_mapping: 5 years');
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
