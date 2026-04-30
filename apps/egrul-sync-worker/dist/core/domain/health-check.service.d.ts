/**
 * Health Check Service
 *
 * @remarks
 * Domain Layer — Service в Hexagonal Architecture.
 * Агрегирует health статус всех компонентов системы.
 * Предоставляет единый API для мониторинга здоровья.
 *
 * Следует SRP: ответственен только за агрегацию health статуса.
 * Следует Delegation: делегирует проверку специализированным checker'ам.
 */
import type { ICircuitBreakerManagerPort } from '../ports/i-circuit-breaker-manager.port';
import type { HealthReport } from './types/health.types';
import type { CircuitBreakerHealth } from './types/circuit-breaker-health.types';
/**
 * Health Check Service
 *
 * @remarks
 * Агрегирует состояние:
 * - ClickHouse (через ClickHouseHealthChecker)
 * - Circuit Breaker (напрямую из manager)
 * - Redis (через RedisHealthChecker)
 * - Memory (через MemoryHealthChecker)
 */
export declare class HealthCheckService {
    private readonly circuitBreakerManager;
    private readonly clickhouseChecker;
    private readonly redisChecker;
    private readonly memoryChecker;
    constructor(circuitBreakerManager: ICircuitBreakerManagerPort, clickhouseClient: import('@clickhouse/client').ClickHouseClient);
    /**
     * Возвращает полный отчёт о здоровье системы
     *
     * @remarks
     * Асинхронная проверка всех компонентов.
     */
    getFullHealth(): Promise<HealthReport>;
    /**
     * Возвращает health статус circuit breaker
     *
     * @remarks
     * Синхронная операция (без внешних вызовов).
     */
    getCircuitBreakerHealth(): CircuitBreakerHealth;
    /**
     * Проверяет все компоненты
     *
     * @remarks
     * Параллельная проверка для минимизации времени.
     */
    private checkAllComponents;
    /**
     * Проверяет Circuit Breaker
     *
     * @remarks
     * Синхронная проверка (без внешних вызовов).
     */
    private checkCircuitBreaker;
    /**
     * Агрегирует общий статус из компонентов
     *
     * @remarks
     * Общий статус = худший из компонентов.
     */
    private aggregateStatus;
    /**
     * Вычисляет статус circuit breaker
     *
     * @remarks
     * unhealthy = есть открытые breaker
     * degraded = есть half-open breaker
     * healthy = все закрыты
     */
    private calculateCircuitBreakerStatus;
    /**
     * Подсчитывает активные операции
     *
     * @remarks
     * Заглушка для совместимости с AppState.
     */
    private countActiveOperations;
    /**
     * Возвращает версию приложения
     *
     * @remarks
     * Из package.json или дефолт.
     */
    private getVersion;
}
