/**
 * Sync All Start API
 *
 * Запуск полной синхронизации (EGRUL + Sanctions).
 */

import { NextResponse } from 'next/server';
import { redisClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';
import { createSyncStatus, SyncStage } from 'shared/api';
import type {
  SyncAllStartRequest,
  SyncAllStartResponse
} from '../types';
import { syncAllStartSuccess, syncAllStartError } from '../types';

export const dynamic = 'force-dynamic';

/**
 * Redis канал для полной синхронизации
 */
const SYNC_ALL_CHANNEL = 'sync:all:start';
const SYNC_ALL_STATUS_KEY = 'sync:status:all';

/**
 * POST /api/sync/all/start — запуск полной синхронизации
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    // Проверяем, не запущена ли уже синхронизация
    const currentStatus = await redisClient.hgetall(SYNC_ALL_STATUS_KEY);

    if (currentStatus.status === 'running') {
      const response: SyncAllStartResponse = syncAllStartError(
        'SYNC_ALREADY_RUNNING',
        'Синхронизация уже запущена'
      );
      return NextResponse.json(response, { status: 400 });
    }

    // Читаем опции из тела запроса
    let options: SyncAllStartRequest = {};
    try {
      const body = await request.json();
      options = body as SyncAllStartRequest;
    } catch {
      // Используем опции по умолчанию
    }

    // Инициализируем статус
    const initialStatus = createSyncStatus(
      'running',
      SyncStage.IDLE,
      'Инициализация полной синхронизации...',
      undefined,  // percentage - indeterminate
      new Date().toISOString()
    );

    await redisClient.hset(SYNC_ALL_STATUS_KEY,
      'status', initialStatus.status,
      'stage', initialStatus.stage,
      'message', initialStatus.message,
      'startedAt', initialStatus.startedAt ?? ''
    );
    // percentage устанавливаем только если есть значение
    if (initialStatus.percentage !== undefined) {
      await redisClient.hset(SYNC_ALL_STATUS_KEY, 'percentage', String(initialStatus.percentage));
    } else {
      await redisClient.hdel(SYNC_ALL_STATUS_KEY, 'percentage');
    }

    // Публикуем событие запуска
    await redisClient.publish(
      SYNC_ALL_CHANNEL,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        enableEnrichment: options.enableEnrichment ?? false
      })
    );

    const response: SyncAllStartResponse = syncAllStartSuccess(
      'Синхронизация запущена'
    );

    return NextResponse.json(response);

  } catch (error) {
    console.error('Sync all start error:', error);

    const message = error instanceof Error ? error.message : 'Не удалось запустить синхронизацию';
    const response: SyncAllStartResponse = syncAllStartError(
      'SYNC_START_FAILED',
      message
    );

    return NextResponse.json(response, { status: 500 });
  }
}
