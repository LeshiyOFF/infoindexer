/**
 * Sanctions Sync Start API
 *
 * Запускает синхронизацию только санкций из OpenSanctions.
 * Обновляет данные о санкционных программах без полной перезагрузки ЕГРЮЛ.
 */

import { NextResponse } from 'next/server';
import { redisPub, redisClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

/**
 * Redis канал для синхронизации санкций
 */
const SANCTIONS_SYNC_CHANNEL = 'sync:sanctions:start';

/**
 * Redis ключ для статуса синхронизации санкций
 */
const SANCTIONS_STATUS_KEY = 'sync:status:sanctions';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sync/sanctions/start — запуск синхронизации санкций
 */
export async function POST(request: Request): Promise<NextResponse> {
  // Проверка авторизации
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, {
      status: UNAUTHORIZED_RESPONSE.status
    });
  }

  try {
    // Проверяем, не запущена ли уже синхронизация
    const currentStatus = await redisClient.hgetall(SANCTIONS_STATUS_KEY);

    if (currentStatus.status === 'running') {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_RUNNING', message: 'Синхронизация уже запущена' } },
        { status: 400 }
      );
    }

    // Инициализируем статус
    await redisClient.hset(
      SANCTIONS_STATUS_KEY,
      'status', 'running',
      'percentage', '0',
      'message', 'Инициализация загрузки санкций...',
      'startedAt', new Date().toISOString()
    );

    // Публикуем событие запуска
    await redisPub.publish(
      SANCTIONS_SYNC_CHANNEL,
      JSON.stringify({
        timestamp: new Date().toISOString()
      })
    );

    return NextResponse.json({
      success: true,
      data: { message: 'Синхронизация санкций запущена' }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось запустить синхронизацию';

    return NextResponse.json(
      { success: false, error: { code: 'START_FAILED', message } },
      { status: 500 }
    );
  }
}
