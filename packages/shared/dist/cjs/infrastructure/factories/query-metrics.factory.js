"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueryMetricsService = createQueryMetricsService;
/**
 * Query Metrics Factory
 *
 * @remarks
 * Factory для создания IQueryMetricsCollector реализаций.
 * Следует SRP: только создание объектов.
 * Следует OCP: можно добавить новые типы без изменения кода.
 */
const console_query_metrics_adapter_1 = require("../adapters/console-query-metrics.adapter");
/**
 * Создать коллектор метрик с console выводом
 *
 * @returns Экземпляр ConsoleQueryMetricsCollector
 */
function createQueryMetricsService() {
    return new console_query_metrics_adapter_1.ConsoleQueryMetricsCollector();
}
