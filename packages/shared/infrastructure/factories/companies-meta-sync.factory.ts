/**
 * Companies Meta Sync Factory
 *
 * @remarks
 * Factory для создания CompaniesMetaSyncWorker.
 * Следует SRP: только создание worker.
 * Следует DIP: возвращает абстракцию (worker), не детали реализации.
 */
import { createQueryMetricsService } from './query-metrics.factory';
import { CompaniesMetaSyncWorker } from '../workers/companies-meta-sync.worker';
import type { ICircuitBreakerPort } from '../circuit-breaker/ports/i-circuit-breaker.port';

/**
 * Создать worker для синхронизации companies_meta
 *
 * @param breaker - Опциональный Circuit Breaker для защиты операций
 * @returns Настроенный экземпляр CompaniesMetaSyncWorker
 */
export function createCompaniesMetaSyncWorker(
  breaker?: ICircuitBreakerPort
): CompaniesMetaSyncWorker {
  const metrics = createQueryMetricsService();
  return new CompaniesMetaSyncWorker(metrics, breaker);
}
