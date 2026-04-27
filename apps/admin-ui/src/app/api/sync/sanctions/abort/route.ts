/**
 * Sanctions Abort API
 *
 * @remarks
 * POST /api/sync/sanctions/abort — отмена синхронизации санкций.
 */

import { NextResponse } from 'next/server';
import { redisPub } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sync/sanctions/abort
 */
export async function POST(request: Request): Promise<NextResponse> {
  // Проверка авторизации
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, {
      status: UNAUTHORIZED_RESPONSE.status
    });
  }

  try {
    // Публикуем команду отмены в Redis
    await redisPub.publish('sync:sanctions:abort', JSON.stringify({
      operationId: 'sanctions',
      timestamp: Date.now()
    }));

    return NextResponse.json({
      success: true,
      message: 'Команда отмены отправлена'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось отправить команду отмены';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
