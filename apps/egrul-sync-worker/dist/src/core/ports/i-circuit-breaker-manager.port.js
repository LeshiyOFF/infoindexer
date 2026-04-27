"use strict";
/**
 * Port для Circuit Breaker Manager
 *
 * @remarks
 * Порт в Hexagonal Architecture.
 * Facade для управления множеством circuit breaker.
 * Обеспечивает единую точку входа для операций с защитой.
 *
 * Следует Interface Segregation: фокусированные методы.
 * Следует Dependency Inversion: Domain → Interface ← Infrastructure.
 */
Object.defineProperty(exports, "__esModule", { value: true });
