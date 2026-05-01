import { NextResponse } from 'next/server';
import { clickhouseClient } from 'shared/clickhouse';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/refresh-summary — статус обновления summary
 *
 * С Materialized View ручное обновление не требуется.
 * MV обновляется автоматически при INSERT в financial_reports.
 */
export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    // Проверяем что MV существует
    const result = await clickhouseClient.query({
      query: `
        SELECT count() as cnt
        FROM system.tables
        WHERE database = currentDatabase()
        AND name = 'financial_reports_summary_mv'
      `,
      format: 'JSONEachRow'
    });

    const rows = await result.json() as { cnt: string }[];
    const mvExists = parseInt(rows[0]?.cnt || '0', 10) > 0;

    if (!mvExists) {
      return NextResponse.json({
        autoUpdated: false,
        tableExists: false,
        message: 'Materialized View not found. Run migrations first.'
      }, { status: 503 });
    }

    // Получаем количество записей в MV
    const countResult = await clickhouseClient.query({
      query: 'SELECT count() as cnt FROM financial_reports_summary',
      format: 'JSONEachRow'
    });

    const countRows = await countResult.json() as { cnt: string }[];
    const rowCount = parseInt(countRows[0]?.cnt || '0', 10);

    return NextResponse.json({
      autoUpdated: true,
      tableExists: true,
      rowCount,
      message: 'Summary auto-updates via Materialized View on INSERT'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
