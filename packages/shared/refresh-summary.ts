/**
 * Zero-Downtime Refresh Summary — RENAME approach (downtime < 100мс)
 * Architecture: Domain → UseCase → Infrastructure
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type { IMigrationLock } from './infrastructure/ports/i-migration-lock.port';
import {
  TARGET_TABLE,
  CREATE_TABLE_SQL,
  POPULATE_SQL,
  OPTIMIZE_SQL,
  COUNT_SQL
} from './infrastructure/refresh-summary.sql';

/** Progress reporter callback (Port) */
export type RefreshProgressReporter = (
  stage: string,
  percentage: number,
  message: string
) => Promise<void> | void;

/** Опции для refreshFinancialSummary */
export interface RefreshOptions {
  reportProgress?: RefreshProgressReporter;
  dryRun?: boolean;
  lock?: IMigrationLock;
  lockKey?: string;
  lockTimeoutMs?: number;
}

/** Результат выполнения refresh */
export interface RefreshResult {
  rows: number;
  elapsedMs: number;
}

/**
 * Атомарно обновляет financial_reports_summary без downtime
 * @example
 * await refreshFinancialSummary(client, { reportProgress: (s, p, m) => console.log(m) });
 */
export async function refreshFinancialSummary(
  client: ClickHouseClient,
  options: RefreshOptions = {}
): Promise<RefreshResult> {
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
async function executeRefresh(
  client: ClickHouseClient,
  report?: RefreshProgressReporter
): Promise<RefreshResult> {
  const start = Date.now();
  const timestamp = Date.now();
  const tempTable = `${TARGET_TABLE}_temp_${timestamp}`;
  const oldTable = `${TARGET_TABLE}_old_${timestamp}`;

  await runCommand(client, CREATE_TABLE_SQL, { table: tempTable });
  await report?.('create_temp', 5, 'Создание временной таблицы');

  await runCommand(client, POPULATE_SQL, { table: tempTable });
  await report?.('populate', 15, 'Загрузка данных');

  await runCommand(client, OPTIMIZE_SQL, { table: tempTable });
  await report?.('optimize', 80, 'Оптимизация');

  const count = await countRows(client, tempTable);
  await report?.('validate', 90, 'Валидация данных');
  if (count === 0) throw new Error('Validation failed: no data in temporary table');

  // Atomic swap via RENAME (DDL не поддерживает параметризацию)
  await report?.('rename_old', 93, 'Переименование старой таблицы');
  await client.command({ query: `RENAME TABLE ${TARGET_TABLE} TO ${oldTable}` });

  await report?.('rename_new', 95, 'Активация новой таблицы');
  await client.command({ query: `RENAME TABLE ${tempTable} TO ${TARGET_TABLE}` });

  await report?.('cleanup', 98, 'Удаление старой таблицы');
  try {
    await client.command({ query: `DROP TABLE ${oldTable}` });
  } catch (e) {
    console.error(`[Refresh] Failed to drop ${oldTable}:`, e);
  }

  const rows = await countRows(client, TARGET_TABLE);
  await report?.('done', 100, 'Готово');

  return { rows, elapsedMs: Date.now() - start };
}

/** Выполняет команду с параметрами */
async function runCommand(
  client: ClickHouseClient,
  query: string,
  params: Record<string, string>
): Promise<void> {
  await client.command({ query, query_params: params });
}

/** Подсчитывает количество строк */
async function countRows(client: ClickHouseClient, tableName: string): Promise<number> {
  const result = await client.query({
    query: COUNT_SQL,
    query_params: { table: tableName },
    format: 'JSONEachRow'
  });
  const rows = await result.json() as { c: string }[];
  return parseInt(rows[0]?.c || '0');
}
