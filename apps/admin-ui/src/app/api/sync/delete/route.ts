import { NextResponse } from 'next/server';
import { redisPub, redisClient } from 'shared';
import { clickhouseClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const { year } = await request.json();
    if (!year) {
      return NextResponse.json({ error: 'Year is required' }, { status: 400 });
    }
    
    // Abort if running
    await redisPub.publish('sync:abort', JSON.stringify({ year }));
    
    // Delete data from ClickHouse (use lightweight mutation)
    try {
      await clickhouseClient.command({
        query: `ALTER TABLE financial_reports DELETE WHERE year = {year: Int32}`,
        query_params: { year }
      });
    } catch (e) {
      // Ignore if table doesn't exist yet
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('UNKNOWN_TABLE')) {
        console.error("ClickHouse delete error:", e);
      }
    }

    // Clear redis state
    await redisClient.del(`sync:status:${year}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
