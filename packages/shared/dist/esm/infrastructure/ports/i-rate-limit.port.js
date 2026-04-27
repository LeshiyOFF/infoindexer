/**
 * Rate Limit Port
 *
 * @remarks
 * Infrastructure Layer: Port interface для rate limiting.
 * Часть Hexagonal/Ports & Adapters архитектуры.
 *
 * Architecture:
 * - Port (Infrastructure Layer): Этот interface
 * - Adapter (Infrastructure Layer): RedisRateLimitAdapter
 * - API Layer зависит от этого Port (DIP)
 *
 * Design Decision: Minimal interface
 * - Два метода: check() для проверки, isHealthy() для health check
 * - Async: поддерживает remote storage (Redis)
 * - Error handling: throws для системных ошибок
 *
 * Implementations:
 * - RedisRateLimitAdapter: Redis с INCR/EXPIRE (Iteration 14)
 *
 * Iteration 14: Rate Limiting
 */
export {};
