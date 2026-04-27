/**
 * Rate limiter для защиты от brute-force. Использует Redis.
 */
import { redisClient } from 'shared';

const AUTH_RATE_PREFIX = 'auth:ratelimit:';
const AUTH_RATE_MAX = 5;
const AUTH_RATE_WINDOW_SEC = 15 * 60;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function checkAuthRateLimit(request: Request): Promise<{ allowed: boolean }> {
  try {
    const ip = getClientIp(request);
    const key = `${AUTH_RATE_PREFIX}${ip}`;
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, AUTH_RATE_WINDOW_SEC);
    }
    return { allowed: count <= AUTH_RATE_MAX };
  } catch {
    return { allowed: false };
  }
}
