import { NextResponse } from 'next/server';
import { createCompaniesMetaSyncWorker } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/companies-meta-sync — триггер ручной синхронизации
 *
 * Запускает единоразовую синхронизацию companies_meta изменений в MV.
 * Обычно worker делает это автоматически каждые 5 минут.
 */
export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const worker = createCompaniesMetaSyncWorker();
    const stats = await worker.syncOnce();

    return NextResponse.json({
      success: !stats.error,
      innsProcessed: stats.innsProcessed,
      durationMs: stats.durationMs,
      error: stats.error
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/companies-meta-sync — статус синхронизации
 *
 * Возвращает текущее состояние синхронизации.
 */
export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const { clickhouseClient } = await import('shared/clickhouse');

    const result = await clickhouseClient.query({
      query: `
        SELECT last_sync_at, rows_processed
        FROM companies_meta_sync_state
        WHERE table_name = 'companies_meta'
      `,
      format: 'JSONEachRow'
    });

    const rows = await result.json() as {
      last_sync_at: string;
      rows_processed: number;
    }[];

    if (rows.length === 0) {
      return NextResponse.json({
        synced: false,
        message: 'Sync state not initialized'
      });
    }

    return NextResponse.json({
      synced: true,
      lastSyncAt: rows[0].last_sync_at,
      rowsProcessed: rows[0].rows_processed
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
