import { NextResponse } from 'next/server';
import { clickhouseClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** GET /api/organizations/okved-list — список кодов ОКВЭД из БД */
export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, {
      status: UNAUTHORIZED_RESPONSE.status
    });
  }

  const runQuery = async (table: string, col: string): Promise<{ code: string }[]> => {
    const res = await clickhouseClient.query({
      query: `
        SELECT DISTINCT ${col} AS code
        FROM ${table}
        WHERE ${col} != ''
        ORDER BY code
        LIMIT 5000
      `,
      format: 'JSONEachRow'
    });
    const rows = (await res.json()) as { code: string }[];
    return rows.map((r) => ({ code: r.code }));
  };

  const hasColumn = async (table: string, name: string): Promise<boolean> => {
    const res = await clickhouseClient.query({
      query: `SELECT 1 FROM system.columns WHERE database = currentDatabase() AND table = '${table}' AND name = '${name}' LIMIT 1`,
      format: 'JSONEachRow'
    });
    const rows = (await res.json()) as unknown[];
    return Array.isArray(rows) && rows.length > 0;
  };

  try {
    // 1. financial_reports_summary (если есть колонка okved)
    const summaryHasOkved = await hasColumn('financial_reports_summary', 'okved');
    if (summaryHasOkved) {
      const data = await runQuery('financial_reports_summary', 'okved');
      if (data.length > 0) return NextResponse.json({ data });
    }

    // 2. Fallback: financial_reports (okved или okved2)
    const frHasOkved = await hasColumn('financial_reports', 'okved');
    const frHasOkved2 = await hasColumn('financial_reports', 'okved2');
    const col = frHasOkved ? 'okved' : frHasOkved2 ? 'okved2' : null;
    if (col) {
      const data = await runQuery('financial_reports', col);
      return NextResponse.json({ data });
    }

    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error('[API okved-list]', error);
    return NextResponse.json({ data: [], error: 'Ошибка загрузки ОКВЭД' }, { status: 500 });
  }
}
