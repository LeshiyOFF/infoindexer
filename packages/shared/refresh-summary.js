"use strict";
/**
 * Zero-Downtime Refresh Summary — RENAME approach (downtime < 100мс)
 * Architecture: Domain → UseCase → Infrastructure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshFinancialSummary = refreshFinancialSummary;
const refresh_summary_sql_1 = require("./infrastructure/refresh-summary.sql");
/**
 * Атомарно обновляет financial_reports_summary без downtime
 * @example
 * await refreshFinancialSummary(client, { reportProgress: (s, p, m) => console.log(m) });
 */
async function refreshFinancialSummary(client, options = {}) {
    if (options.dryRun) {
        console.log('[DRY RUN] Skipping refresh operations');
        await options.reportProgress?.('dry_run', 100, 'Dry-run mode: no changes made');
        return { rows: 0, elapsedMs: 0 };
    }
    const action = async () => await executeRefresh(client, options.reportProgress);
    if (options.lock) {
        const lockKey = options.lockKey ?? 'migration:financial_reports_summary';
        const timeoutMs = options.lockTimeoutMs ?? 5 * 60 * 1000;
        return await options.lock.execute({ lockKey, timeoutMs, owner: 'refresh-summary' }, action);
    }
    return await action();
}
/** Выполняет refresh без lock */
async function executeRefresh(client, report) {
    const start = Date.now();
    const timestamp = Date.now();
    const tempTable = `${refresh_summary_sql_1.TARGET_TABLE}_temp_${timestamp}`;
    const oldTable = `${refresh_summary_sql_1.TARGET_TABLE}_old_${timestamp}`;
    await runCommand(client, refresh_summary_sql_1.CREATE_TABLE_SQL, { table: tempTable });
    await report?.('create_temp', 5, 'Создание временной таблицы');
    await runCommand(client, refresh_summary_sql_1.POPULATE_SQL, { table: tempTable });
    await report?.('populate', 15, 'Загрузка данных');
    await runCommand(client, refresh_summary_sql_1.OPTIMIZE_SQL, { table: tempTable });
    await report?.('optimize', 80, 'Оптимизация');
    const count = await countRows(client, tempTable);
    await report?.('validate', 90, 'Валидация данных');
    if (count === 0)
        throw new Error('Validation failed: no data in temporary table');
    // Atomic swap via RENAME (DDL не поддерживает параметризацию)
    await report?.('rename_old', 93, 'Переименование старой таблицы');
    await client.command({ query: `RENAME TABLE ${refresh_summary_sql_1.TARGET_TABLE} TO ${oldTable}` });
    await report?.('rename_new', 95, 'Активация новой таблицы');
    await client.command({ query: `RENAME TABLE ${tempTable} TO ${refresh_summary_sql_1.TARGET_TABLE}` });
    await report?.('cleanup', 98, 'Удаление старой таблицы');
    try {
        await client.command({ query: `DROP TABLE ${oldTable}` });
    }
    catch (e) {
        console.error(`[Refresh] Failed to drop ${oldTable}:`, e);
    }
    const rows = await countRows(client, refresh_summary_sql_1.TARGET_TABLE);
    await report?.('done', 100, 'Готово');
    return { rows, elapsedMs: Date.now() - start };
}
/** Выполняет команду с параметрами */
async function runCommand(client, query, params) {
    await client.command({ query, query_params: params });
}
/** Подсчитывает количество строк */
async function countRows(client, tableName) {
    const result = await client.query({
        query: refresh_summary_sql_1.COUNT_SQL,
        query_params: { table: tableName },
        format: 'JSONEachRow'
    });
    const rows = await result.json();
    return parseInt(rows[0]?.c || '0');
}
