import { CompaniesMetaSyncWorker } from '../workers/companies-meta-sync.worker';
import type { ICircuitBreakerPort } from '../circuit-breaker/ports/i-circuit-breaker.port';
/**
 * Создать worker для синхронизации companies_meta
 *
 * @param breaker - Опциональный Circuit Breaker для защиты операций
 * @returns Настроенный экземпляр CompaniesMetaSyncWorker
 */
export declare function createCompaniesMetaSyncWorker(breaker?: ICircuitBreakerPort): CompaniesMetaSyncWorker;
