/**
 * Sanctions Sync Status API
 *
 * Возвращает текущий статус синхронизации санкций.
 */

import { NextResponse } from 'next/server';
import { redisClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

const SANCTIONS_STATUS_KEY = 'sync:status:sanctions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sync/sanctions — статус синхронизации санкций
 */
export async function GET(request: Request): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, {
      status: UNAUTHORIZED_RESPONSE.status
    });
  }

  try {
    const status = await redisClient.hgetall(SANCTIONS_STATUS_KEY);

    if (!status || Object.keys(status).length === 0) {
      return NextResponse.json({
        status: 'idle',
        percentage: 0,
        message: 'Синхронизация не запускалась'
      });
    }

    return NextResponse.json(status);

  } catch (error) {
    console.error('Sanctions status error:', error);

    return NextResponse.json(
      { error: 'Не удалось получить статус' },
      { status: 500 }
    );
  }
}
