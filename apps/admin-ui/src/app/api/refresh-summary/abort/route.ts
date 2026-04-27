/**
 * Refresh Summary Abort API
 *
 * @remarks
 * POST /api/refresh-summary/abort — отмена обновления кэша.
 */

import { NextResponse } from 'next/server';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';
import { activeOperations } from '@/lib/active-operations';

export const dynamic = 'force-dynamic';

/**
 * POST /api/refresh-summary/abort
 */
export async function POST(request: Request): Promise<NextResponse> {
  // Проверка авторизации
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, {
      status: UNAUTHORIZED_RESPONSE.status
    });
  }

  try {
    // Прерываем операцию через менеджер
    const aborted = activeOperations.abort('summary');

    if (!aborted) {
      return NextResponse.json(
        { success: false, error: 'Нет активной операции для отмены' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Операция отменена'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось отправить команду отмены';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
