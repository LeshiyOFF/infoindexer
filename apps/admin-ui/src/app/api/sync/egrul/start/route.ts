import { NextResponse } from 'next/server';
import { redisPub, redisClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const state = await redisClient.hgetall('sync:status:egrul');
    if (state?.status === 'running') {
      return NextResponse.json({ error: 'Синхронизация уже запущена' }, { status: 400 });
    }

    await redisPub.publish('sync:egrul:start', '{}');
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

