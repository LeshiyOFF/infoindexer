import { NextResponse } from 'next/server';
import { redisClient } from 'shared/redis';
import { clickhouseClient } from 'shared/clickhouse';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

/**
 * POST /api/sync/egrul/delete — полная очистка реестра ЕГРЮЛ
 *
 * @remarks
 * MV Approach: companies_meta is now a VIEW, not a table.
 * TRUNCATE does not work on VIEWs.
 *
 * Solution: Drop and recreate underlying MVs and VIEWs.
 * Next EGRUL sync will repopulate data incrementally.
 */
export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, {
      status: UNAUTHORIZED_RESPONSE.status
    });
  }

  try {
    const state = await redisClient.hgetall('sync:status:egrul');
    if (state?.status === 'running') {
      return NextResponse.json(
        { error: 'Синхронизация ЕГРЮЛ в процессе. Дождитесь завершения.' },
        { status: 400 }
      );
    }

    // MV Approach: Drop MVs and VIEWs (companies_meta is a VIEW)
    // Data will be repopulated on next EGRUL sync
    await clickhouseClient.command({ query: 'DROP TABLE IF EXISTS companies_mv' });
    await clickhouseClient.command({ query: 'DROP TABLE IF EXISTS directors_mv' });
    await clickhouseClient.command({ query: 'DROP TABLE IF EXISTS founders_mv' });
    await clickhouseClient.command({ query: 'DROP VIEW IF EXISTS v_companies_meta' });
    await clickhouseClient.command({ query: 'DROP VIEW IF EXISTS companies_meta' });

    // Clear denormalized tables
    await clickhouseClient.command({ query: 'TRUNCATE TABLE IF EXISTS egrul_directors_denormalized' });
    await clickhouseClient.command({ query: 'TRUNCATE TABLE IF EXISTS egrul_founders_denormalized' });
    await clickhouseClient.command({ query: 'TRUNCATE TABLE IF EXISTS egrul_companies_raw' });

    await redisClient.del('sync:status:egrul');

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
