"use strict";
/**
 * Port для Circuit Breaker — защита от каскадных сбоев
 *
 * @remarks
 * Порт в Hexagonal Architecture.
 * Абстрагирует логику circuit breaker: предотвращение каскадных сбоев
 * при вызове внешних зависимостей.
 *
 * Следует Dependency Inversion: Domain → Interface ← Infrastructure.
 * Следует Interface Segregation: фокусированные методы.
 *
 * @see {@link https://martinfowler.com/bliki/CircuitBreaker.html | Martin Fowler on Circuit Breaker}
 *
 * @example
 * ```ts
 * class DatabaseService {
 *   constructor(private readonly breaker: ICircuitBreakerPort) {}
 *
 *   async query<T>(sql: string): Promise<T> {
 *     return this.breaker.execute(async () => {
 *       return await this.db.query(sql);
 *     });
 *   }
 * }
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitState = void 0;
var circuit_breaker_types_1 = require("./types/circuit-breaker.types");
Object.defineProperty(exports, "CircuitState", { enumerable: true, get: function () { return circuit_breaker_types_1.CircuitState; } });
