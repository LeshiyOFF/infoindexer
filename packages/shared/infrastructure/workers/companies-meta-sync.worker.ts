/**
 * Companies Meta Sync Worker
 *
 * @remarks
 * Background worker для синхронизации изменений companies_meta в MV.
 * Следует SRP: только координация процесса синхронизации.
 * Следует DIP: зависит от IQueryMetricsCollector port.
 *
 * Проблема: Materialized View обновляется при INSERT в financial_reports,
 * но изменения в companies_meta не захватываются автоматически.
 *
 * Решение:
 * 1. Проверять companies_meta_sync_state.last_sync_at
 * 2. Найти INNs с updated_at > last_sync_at
 * 3. Re-insert financial_reports для этих INNs → триггер обновления MV
 * 4. Обновить last_sync_at
 *
 * Память: обрабатывает чанками по 10K INNs для избежания OOM.
 *
 * Fault Tolerance: Использует Circuit Breaker для защиты ClickHouse операций.
 */
import { clickhouseClient } from '../../clickhouse';
import type { IQueryMetricsCollector } from '../ports/i-query-metrics-collector.port';
import type { ICircuitBreakerPort } from '../circuit-breaker/ports/i-circuit-breaker.port';
import { createCircuitBreakerForClickHouse } from '../circuit-breaker/factories/circuit-breaker.factory';

interface SyncState {
  lastSyncAt: Date;
  rowsProcessed: number;
}

interface SyncStats {
  innsProcessed: number;
  durationMs: number;
  error?: string;
}

const CHUNK_SIZE = 10000;
const SYNC_INTERVAL_MS = 300000; // 5 минут

export class CompaniesMetaSyncWorker {
  private running = false;
  private timer?: NodeJS.Timeout;
  private readonly breaker: ICircuitBreakerPort;

  constructor(
    private readonly metrics: IQueryMetricsCollector,
    breaker?: ICircuitBreakerPort
  ) {
    this.breaker = breaker ?? createCircuitBreakerForClickHouse('companies-meta-sync');
  }

  /**
   * Запустить периодическую синхронизацию
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    this.scheduleNext();
  }

  /**
   * Остановить периодическую синхронизацию
   */
  stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  /**
   * Выполнить один цикл синхронизации
   */
  async syncOnce(): Promise<SyncStats> {
    const startTime = Date.now();
    let innsProcessed = 0;

    try {
      const state = await this.getSyncState();

      // Обрабатываем чанками
      while (true) {
        const inns = await this.getPendingInns(state.lastSyncAt, CHUNK_SIZE);

        if (inns.length === 0) break;

        await this.syncInns(inns);
        innsProcessed += inns.length;
      }

      // Обновляем состояние синхронизации
      await this.updateSyncState(innsProcessed);

      return {
        innsProcessed,
        durationMs: Date.now() - startTime
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.metrics.recordError('companies_meta_sync', message);

      return {
        innsProcessed,
        durationMs: Date.now() - startTime,
        error: message
      };
    }
  }

  private scheduleNext(): void {
    if (!this.running) return;

    this.timer = setTimeout(async () => {
      await this.syncOnce();
      this.scheduleNext();
    }, SYNC_INTERVAL_MS);
  }

  private async getSyncState(): Promise<SyncState> {
    const result = await clickhouseClient.query({
      query: `
        SELECT last_sync_at, rows_processed
        FROM companies_meta_sync_state
        WHERE table_name = {table_name:String}
      `,
      query_params: { table_name: 'companies_meta' },
      format: 'JSONEachRow'
    });

    const rows = await result.json() as {
      last_sync_at: string;
      rows_processed: number;
    }[];

    if (rows.length === 0) {
      // Инициализируем состояние
      await clickhouseClient.command({
        query: `INSERT INTO companies_meta_sync_state VALUES ('companies_meta', now(), 0)`
      });
      return { lastSyncAt: new Date(0), rowsProcessed: 0 };
    }

    return {
      lastSyncAt: new Date(rows[0].last_sync_at),
      rowsProcessed: rows[0].rows_processed
    };
  }

  private async getPendingInns(since: Date, limit: number): Promise<string[]> {
    const result = await clickhouseClient.query({
      query: `
        SELECT DISTINCT inn
        FROM companies_meta
        WHERE updated_at > {since:DateTime}
        ORDER BY inn
        LIMIT {limit:UInt32}
      `,
      query_params: {
        since: since.toISOString(),
        limit
      },
      format: 'JSONEachRow'
    });

    const rows = await result.json() as { inn: string }[];
    return rows.map(r => r.inn);
  }

  private async syncInns(inns: string[]): Promise<void> {
    const startTime = Date.now();

    await this.breaker.execute(async () => {
      await clickhouseClient.command({
        query: `
          INSERT INTO financial_reports_summary_mv
          SELECT
            fr.inn,
            argMaxState(fr.ogrn, fr.year) as ogrn_state,
            argMaxState(fr.region, fr.year) as region_state,
            argMaxState(fr.lon, fr.year) as lon_state,
            argMaxState(fr.lat, fr.year) as lat_state,
            maxState(fr.year) as latest_year_state,
            countState() as records_count_state,
            sumState(toFloat64OrZero(toString(fr.PL_revenue))) as revenue_state,
            sumState(toFloat64OrZero(toString(fr.PL_net_profit))) as net_profit_state,
            sumState(toFloat64OrZero(toString(fr.B_charter_capital))) as charter_capital_state,
            avgState(toFloat32OrZero(toString(fr.age))) as age_state,
            argMaxState(fr.okved, fr.year) as okved_state,
            argMaxState(cm.director, cm.updated_at) as director_state,
            argMaxState(cm.name, cm.updated_at) as name_state,
            argMaxState(cm.status, cm.updated_at) as status_state,
            max(fr.updated_at) as updated_at
          FROM financial_reports fr
          INNER JOIN companies_meta cm ON fr.inn = cm.inn
          WHERE fr.inn IN ({inns:Array(String)})
          GROUP BY fr.inn
        `,
        query_params: { inns }
      });
    });

    const duration = Date.now() - startTime;
    this.metrics.recordQuery('sync_inns', duration, inns.length);
  }

  private async updateSyncState(rowsProcessed: number): Promise<void> {
    await clickhouseClient.command({
      query: `
        ALTER TABLE companies_meta_sync_state
        UPDATE last_sync_at = now(), rows_processed = rows_processed + {rows:UInt64}
        WHERE table_name = 'companies_meta'
      `,
      query_params: { rows: rowsProcessed }
    });
  }
}
