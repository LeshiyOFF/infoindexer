/**
 * Rate Limit Info API Route
 *
 * @remarks
 * API Layer: Endpoint для получения информации о rate limits.
 * Показывает текущие лимиты и остаток запросов.
 *
 * Architecture:
 * - API Layer: HTTP handling only
 * - Uses Port (IRateLimitPort) through factory
 * - Auth check via checkAuth()
 *
 * Endpoints:
 * - GET /api/rate-limit - информация о лимитах для всех типов
 *
 * Iteration 14: Rate Limiting
 */

import { NextResponse } from 'next/server';
import { createRateLimitService, RATE_LIMITS } from 'shared';
import type { RateLimitType } from 'shared/client';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';
import { createRateLimitWrapper } from '@/lib/middleware/rate-limit-wrapper';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * GET /api/rate-limit
 *
 * Возвращает информацию о rate limits для текущего клиента.
 * Показывает лимиты и остаток для всех типов запросов.
 */
export async function GET(request: Request): Promise<NextResponse> {
  // Auth check
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const rateLimit = createRateLimitService();
    const wrapper = createRateLimitWrapper(rateLimit);

    // Проверяем лимиты для всех типов
    const types: RateLimitType[] = ['search', 'default', 'sync'];
    const limits: Record<string, {
      limit: number;
      remaining: number;
      resetAt?: number;
    }> = {};

    for (const type of types) {
      const result = await wrapper.check(request, type);
      limits[type] = {
        limit: result.result.limit,
        remaining: result.result.remaining,
        resetAt: result.result.resetAt
      };
    }

    // Конфигурация лимитов (из констант)
    const config = {
      search: RATE_LIMITS.search,
      default: RATE_LIMITS.default,
      sync: RATE_LIMITS.sync
    };

    return NextResponse.json({
      limits,
      config: {
        search: {
          requests: config.search.requests,
          window: config.search.window
        },
        default: {
          requests: config.default.requests,
          window: config.default.window
        },
        sync: {
          requests: config.sync.requests,
          window: config.sync.window
        }
      }
    });
  } catch (error) {
    console.error('[Rate Limit Info Error]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
