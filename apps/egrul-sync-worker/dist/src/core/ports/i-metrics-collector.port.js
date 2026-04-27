"use strict";
/**
 * Port для сбора и экспорта метрик
 *
 * @remarks
 * Порт в Hexagonal Architecture.
 * Абстрагирует способ отправки метрик (console, Prometheus, DataDog).
 * Следует Interface Segregation: только необходимые методы.
 * Следует Dependency Inversion: Domain → Interface ← Infrastructure.
 *
 * @example
 * ```ts
 * class MyService {
 *   constructor(private readonly metrics: IMetricsCollectorPort) {}
 *
 *   async doWork() {
 *     const start = Date.now();
 *     try {
 *       // ... работа ...
 *       this.metrics.recordCounter('work.completed', 1, { type: 'batch' });
 *     } catch (e) {
 *       this.metrics.recordCounter('work.failed', 1, { type: 'batch' });
 *       throw e;
 *     } finally {
 *       this.metrics.recordTiming('work.duration', Date.now() - start);
 *     }
 *   }
 * }
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
