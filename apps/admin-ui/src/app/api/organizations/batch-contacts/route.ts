import { NextResponse } from 'next/server';
import { redisPub, redisClient } from 'shared/redis';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

const BATCH_LIMIT = 50;
const BATCH_TTL_DAYS = 7;
const BATCH_TTL_SEC = BATCH_TTL_DAYS * 24 * 60 * 60;

interface BatchInnItem {
  inn: string;
  name?: string;
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const body = (await request.json()) as { batchId?: string; inns?: string[] };
    const { batchId } = body;

    let inns: BatchInnItem[];

    if (batchId) {
      const meta = await redisClient.hgetall(`batch:${batchId}`);
      if (!meta || !meta.inns) {
        return NextResponse.json({ error: 'Batch not found or invalid' }, { status: 404 });
      }
      inns = JSON.parse(meta.inns) as BatchInnItem[];
      await redisClient.hset(`batch:${batchId}`, 'status', 'running');
      await redisClient.hset(`batch:${batchId}:inn_status`, '__', '0');
      await redisClient.expire(`batch:${batchId}:inn_status`, BATCH_TTL_SEC);
    } else {
      const rawInns = Array.isArray(body?.inns) ? body.inns : [];
      if (rawInns.length === 0) {
        return NextResponse.json({ error: 'batchId or inns array is required' }, { status: 400 });
      }
      const validInns = rawInns.filter((id): id is string => typeof id === 'string' && id.length > 0);
      if (validInns.length > BATCH_LIMIT) {
        return NextResponse.json(
          { error: `Maximum ${BATCH_LIMIT} organizations per batch` },
          { status: 400 }
        );
      }
      inns = validInns.map(inn => ({ inn }));
    }

    const validInns = inns.filter(x => x.inn).map(x => x.inn);

    for (const inn of validInns) {
      const payload = batchId ? { inn, batchId } : { inn };
      await redisPub.publish('contacts:parse', JSON.stringify(payload));
      const key = `contacts:status:${inn}`;
      await redisClient.hdel(key, 'stage', 'error');
      await redisClient.hset(key, { status: 'running', data: '' });
    }

    return NextResponse.json({
      success: true,
      queued: validInns.length,
      batchId: batchId ?? null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
