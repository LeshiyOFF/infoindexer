/**
 * Sync All Status API
 *
 * Получение статуса полной синхронизации.
 */

import { NextResponse } from 'next/server';
import { redisClient } from 'shared/redis';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';
import { SyncStage, type SyncStatus } from 'shared/client';
import type { SyncAllStatusData } from '../types';
import { syncAllSuccess, syncAllError } from '../types';

export const dynamic = 'force-dynamic';

/**
 * Redis ключ для статуса полной синхронизации
 */
const SYNC_ALL_STATUS_KEY = 'sync:status:all';

/**
 * Парсит статус синхронизации из строки
 */
function parseSyncStatus(value: string): SyncStatus {
  if (value === 'running' || value === 'completed' || value === 'error') {
    return value;
  }
  return 'idle';
}

/**
 * Парсит стадию из строки
 */
function parseSyncStage(value: string): SyncStage {
  const validStages = new Set(Object.values(SyncStage));
  if (validStages.has(value as SyncStage)) {
    return value as SyncStage;
  }
  return SyncStage.IDLE;
}

/**
 * GET /api/sync/all/status — получение статуса синхронизации
 */
export async function GET(request: Request): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const state = await redisClient.hgetall(SYNC_ALL_STATUS_KEY);

    // Если статуса нет, возвращаем idle
    if (Object.keys(state).length === 0) {
      const data: SyncAllStatusData = {
        status: 'idle',
        stage: SyncStage.IDLE,
        percentage: 0,
        message: 'Ожидание запуска'
      };

      return NextResponse.json(syncAllSuccess(data));
    }

    const data: SyncAllStatusData = {
      status: parseSyncStatus(state.status),
      stage: parseSyncStage(state.stage),
      percentage: parseInt(state.percentage || '0', 10),
      message: state.message ?? '',
      startedAt: state.startedAt,
      completedAt: state.completedAt,
      error: state.error
    };

    return NextResponse.json(syncAllSuccess(data));

  } catch (error) {
    console.error('Sync all status error:', error);

    const message = error instanceof Error ? error.message : 'Не удалось получить статус';
    const response = syncAllError('STATUS_FETCH_FAILED', message);

    return NextResponse.json(response, { status: 500 });
  }
}
