/**
 * Rate Limit Middleware Wrapper
 *
 * @remarks
 * API Layer: Middleware для rate limiting в Next.js routes.
 * Часть Hexagonal/Ports & Adapters архитектуры.
 *
 * Architecture:
 * - API Layer: middleware wrapper
 * - DIP: зависит от IRateLimitPort, не от Redis
 * - SRP: только rate limit логика для API
 *
 * Iteration 14: Rate Limiting
 */

import type { RateLimitType, RateLimitResult } from 'shared/domain/rate-limit';
import type { IRateLimitPort } from 'shared/infrastructure/ports/i-rate-limit.port';
import type { RateLimitHeaders, RateLimitWrapperResult } from './rate-limit-types';

/**
 * Rate Limit Wrapper
 *
 * @remarks
 * Middleware wrapper для rate limiting в API routes.
 * Извлекает identifier из request и проверяет лимит.
 */
export class RateLimitWrapper {
  private readonly rateLimit: IRateLimitPort;

  constructor(rateLimit: IRateLimitPort) {
    this.rateLimit = rateLimit;
  }

  /**
   * Проверить rate limit для Request
   *
   * @param request - Next.js Request
   * @param type - Тип лимита
   * @returns RateLimitWrapperResult
   */
  async check(request: Request, type: RateLimitType): Promise<RateLimitWrapperResult> {
    const identifier = this.getIdentifier(request);
    const result = await this.rateLimit.check(identifier, type);

    if (!result.allowed) {
      const headers = this.buildHeaders(result);
      return { allowed: false, status: 429, headers, result };
    }

    const headers = this.buildHeaders(result);
    return { allowed: true, status: 200, headers, result };
  }

  /**
   * Извлечь идентификатор из Request
   *
   * @param request - Next.js Request
   * @returns Identifier (IP или userId)
   */
  private getIdentifier(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0]?.trim() || 'unknown';
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      return realIp;
    }
    return 'unknown';
  }

  /**
   * Построить headers из результата
   *
   * @param result - RateLimitResult
   * @returns RateLimitHeaders
   */
  private buildHeaders(result: RateLimitResult): RateLimitHeaders {
    const headers: RateLimitHeaders = {
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Limit': result.limit.toString()
    };

    if (result.resetAt !== undefined) {
      headers['X-RateLimit-Reset'] = result.resetAt.toString();
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      if (retryAfter > 0) {
        headers['Retry-After'] = retryAfter.toString();
      }
    }

    return headers;
  }

  /**
   * Создать 429 Response
   *
   * @param wrapperResult - Результат проверки
   * @returns Response с status 429
   */
  createTooManyRequestsResponse(wrapperResult: RateLimitWrapperResult): Response {
    return Response.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: wrapperResult.headers as unknown as Record<string, string>
      }
    );
  }

  /**
   * Добавить headers к существующему Response
   *
   * @param response - Исходный Response
   * @param wrapperResult - Результат проверки
   * @returns Response с добавленными headers
   */
  addHeadersToResponse(
    response: Response,
    wrapperResult: RateLimitWrapperResult
  ): Response {
    const newHeaders = new Headers(response.headers);
    Object.entries(wrapperResult.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        newHeaders.set(key, value);
      }
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
}

/**
 * Создать wrapper с rate limit сервисом
 *
 * @param rateLimit - IRateLimitPort
 * @returns RateLimitWrapper
 */
export function createRateLimitWrapper(rateLimit: IRateLimitPort): RateLimitWrapper {
  return new RateLimitWrapper(rateLimit);
}
