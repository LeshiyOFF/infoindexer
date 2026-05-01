/**
 * Sanctions Sync Start API
 *
 * Запускает синхронизацию только санкций из OpenSanctions.
 * Обновляет данные о санкционных программах без полной перезагрузки ЕГРЮЛ.
 */

import { NextResponse } from 'next/server';
import { redisPub, redisClient, getSubscriberCount } from 'shared/redis';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

const SANCTIONS_SYNC_CHANNEL = 'sync:sanctions:start';
const SANCTIONS_STATUS_KEY = 'sync:status:sanctions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, {
      status: UNAUTHORIZED_RESPONSE.status
    });
  }

  try {
    const currentStatus = await redisClient.hgetall(SANCTIONS_STATUS_KEY);

    if (currentStatus.status === 'running') {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_RUNNING', message: 'Синхронизация уже запущена' } },
        { status: 400 }
      );
    }

    const subscriberCount = await getSubscriberCount(SANCTIONS_SYNC_CHANNEL);

    if (subscriberCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WORKER_UNAVAILABLE',
            message: 'Worker недоступен. Проверьте что egrul-sync-worker запущен.',
            hint: 'Выполните: docker compose logs egrul-sync-worker'
          }
        },
        { status: 503 }
      );
    }

    await redisClient.hset(
      SANCTIONS_STATUS_KEY,
      'status', 'running',
      'percentage', '0',
      'message', 'Инициализация загрузки санкций...',
      'startedAt', new Date().toISOString()
    );

    await redisPub.publish(
      SANCTIONS_SYNC_CHANNEL,
      JSON.stringify({
        timestamp: new Date().toISOString()
      })
    );

    return NextResponse.json({
      success: true,
      data: { message: 'Синхронизация санкций запущена', subscribers: subscriberCount }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось запустить синхронизацию';

    return NextResponse.json(
      { success: false, error: { code: 'START_FAILED', message } },
      { status: 500 }
    );
  }
}
