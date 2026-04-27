/**
 * Health Checker для Circuit Breaker
 *
 * @remarks
 * Domain Layer — Service в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за агрегацию health статуса.
 *
 * Следует SRP: ответственен только за health check.
 */
import type { CircuitStats } from '../ports/i-circuit-breaker.port';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import type { CircuitBreakerHealth } from './types/circuit-breaker-health.types';
/**
 * Health Checker для Circuit Breaker
 *
 * @remarks
 * Агрегирует состояние всех circuit breaker для health check.
 * Предоставляет методы для проверки состояния.
 */
export declare class CircuitBreakerHealthChecker {
    private readonly getBreakers;
    constructor(getBreakers: () => Map<string, ICircuitBreakerPort>);
    /**
     * Возвращает агрегированный health status
     *
     * @returns Health status всех breaker
     *
     * @remarks
     * Подсчитывает количество breaker в каждом состоянии.
     */
    getHealth(): CircuitBreakerHealth;
    /**
     * Возвращает статистику по всем breaker
     *
     * @returns Map имя → статистика
     */
    getAllStats(): Map<string, CircuitStats>;
    /**
     * Проверяет что все breaker в CLOSED состоянии
     *
     * @returns true если все breaker закрыты
     */
    isAllClosed(): boolean;
    /**
     * Возвращает имена breaker в OPEN состоянии
     *
     * @returns Массив имён
     */
    getOpenBreakers(): string[];
}
