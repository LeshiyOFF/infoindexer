import { NextResponse } from 'next/server';
import { redisPub, redisClient, getSubscriberCount } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

const EGRUL_START_CHANNEL = 'sync:egrul:start';

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const state = await redisClient.hgetall('sync:status:egrul');
    if (state?.status === 'running') {
      return NextResponse.json({ error: 'Синхронизация уже запущена' }, { status: 400 });
    }

    const subscriberCount = await getSubscriberCount(EGRUL_START_CHANNEL);

    if (subscriberCount === 0) {
      return NextResponse.json(
        {
          error: 'Worker недоступен. Проверьте что egrul-sync-worker запущен и подписан на канал.',
          hint: 'Выполните: docker compose logs egrul-sync-worker'
        },
        { status: 503 }
      );
    }

    await redisPub.publish(EGRUL_START_CHANNEL, '{}');
    return NextResponse.json({ success: true, subscribers: subscriberCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
