"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckService = void 0;
const clickhouse_health_checker_1 = require("../infrastructure/health-checkers/clickhouse.health-checker");
const redis_health_checker_1 = require("../infrastructure/health-checkers/redis.health-checker");
const memory_health_checker_1 = require("../infrastructure/health-checkers/memory.health-checker");
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
class HealthCheckService {
    circuitBreakerManager;
    clickhouseChecker;
    redisChecker;
    memoryChecker;
    constructor(circuitBreakerManager, clickhouseClient) {
        this.circuitBreakerManager = circuitBreakerManager;
        this.clickhouseChecker = new clickhouse_health_checker_1.ClickHouseHealthChecker(clickhouseClient);
        this.redisChecker = new redis_health_checker_1.RedisHealthChecker();
        this.memoryChecker = new memory_health_checker_1.MemoryHealthChecker();
    }
    /**
     * Возвращает полный отчёт о здоровье системы
     *
     * @remarks
     * Асинхронная проверка всех компонентов.
     */
    async getFullHealth() {
        const timestamp = Date.now();
        const uptime = process.uptime() * 1000;
        const components = await this.checkAllComponents();
        const status = this.aggregateStatus(components);
        const activeOperations = this.countActiveOperations();
        return {
            status,
            timestamp,
            uptime,
            components,
            activeOperations,
            version: this.getVersion()
        };
    }
    /**
     * Возвращает health статус circuit breaker
     *
     * @remarks
     * Синхронная операция (без внешних вызовов).
     */
    getCircuitBreakerHealth() {
        return this.circuitBreakerManager.getHealth();
    }
    /**
     * Проверяет все компоненты
     *
     * @remarks
     * Параллельная проверка для минимизации времени.
     */
    async checkAllComponents() {
        const [clickhouse, redis, memory] = await Promise.all([
            this.clickhouseChecker.check().catch(() => undefined),
            this.redisChecker.check().catch(() => undefined),
            Promise.resolve(this.memoryChecker.check())
        ]);
        const circuitBreaker = this.checkCircuitBreaker();
        return {
            clickhouse,
            redis,
            memory,
            circuitBreaker
        };
    }
    /**
     * Проверяет Circuit Breaker
     *
     * @remarks
     * Синхронная проверка (без внешних вызовов).
     */
    checkCircuitBreaker() {
        const health = this.circuitBreakerManager.getHealth();
        const status = this.calculateCircuitBreakerStatus(health);
        return {
            name: 'circuit-breaker',
            status,
            checkedAt: Date.now(),
            metadata: {
                total: health.total,
                closed: health.closed,
                open: health.open,
                halfOpen: health.halfOpen,
                openBreakers: this.circuitBreakerManager.getOpenBreakers()
            }
        };
    }
    /**
     * Агрегирует общий статус из компонентов
     *
     * @remarks
     * Общий статус = худший из компонентов.
     */
    aggregateStatus(components) {
        const statuses = Object.values(components).filter((c) => c !== undefined).map(c => c.status);
        if (statuses.includes('unhealthy')) {
            return 'unhealthy';
        }
        if (statuses.includes('degraded')) {
            return 'degraded';
        }
        return 'healthy';
    }
    /**
     * Вычисляет статус circuit breaker
     *
     * @remarks
     * unhealthy = есть открытые breaker
     * degraded = есть half-open breaker
     * healthy = все закрыты
     */
    calculateCircuitBreakerStatus(health) {
        if (health.open > 0) {
            return 'unhealthy';
        }
        if (health.halfOpen > 0) {
            return 'degraded';
        }
        return 'healthy';
    }
    /**
     * Подсчитывает активные операции
     *
     * @remarks
     * Заглушка для совместимости с AppState.
     */
    countActiveOperations() {
        try {
            const { getActiveOperations } = require('../../shutdown-handlers');
            return getActiveOperations().size;
        }
        catch {
            return 0;
        }
    }
    /**
     * Возвращает версию приложения
     *
     * @remarks
     * Из package.json или дефолт.
     */
    getVersion() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pkg = require('../../package.json');
            return pkg.version || '0.0.0';
        }
        catch {
            return '0.0.0';
        }
    }
}
exports.HealthCheckService = HealthCheckService;
