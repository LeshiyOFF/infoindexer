import { NextResponse } from 'next/server';
import { clickhouseClient } from 'shared/clickhouse';
import { redisClient } from 'shared/redis';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }
  try {
    const runQuery = async (query: string): Promise<number> => {
      try {
        const result = await clickhouseClient.query({ query, format: 'JSONEachRow' });
        const data = await result.json() as { c: string }[];
        return data && data.length > 0 ? Number(data[0].c) : 0;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes('UNKNOWN_TABLE')) {
          console.error("ClickHouse error:", err);
        }
        return 0;
      }
    };

    const [totalRecords, companiesGirBo, companiesEgrul] = await Promise.all([
      runQuery('SELECT count() as c FROM financial_reports'),
      runQuery('SELECT uniqExact(`inn`) as c FROM financial_reports'),
      runQuery('SELECT count() as c FROM companies_production')
    ]);

    const info = await redisClient.info('memory');
    const usedMemoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const redisMemory = usedMemoryMatch ? usedMemoryMatch[1] : 'Unknown';

    return NextResponse.json({
      totalRecords,
      companiesGirBo,
      companiesEgrul,
      redisMemory
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
