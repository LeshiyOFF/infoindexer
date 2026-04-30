"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompaniesMetaSyncWorker = createCompaniesMetaSyncWorker;
/**
 * Companies Meta Sync Factory
 *
 * @remarks
 * Factory для создания CompaniesMetaSyncWorker.
 * Следует SRP: только создание worker.
 * Следует DIP: возвращает абстракцию (worker), не детали реализации.
 */
const query_metrics_factory_1 = require("./query-metrics.factory");
const companies_meta_sync_worker_1 = require("../workers/companies-meta-sync.worker");
/**
 * Создать worker для синхронизации companies_meta
 *
 * @param breaker - Опциональный Circuit Breaker для защиты операций
 * @returns Настроенный экземпляр CompaniesMetaSyncWorker
 */
function createCompaniesMetaSyncWorker(breaker) {
    const metrics = (0, query_metrics_factory_1.createQueryMetricsService)();
    return new companies_meta_sync_worker_1.CompaniesMetaSyncWorker(metrics, breaker);
}
