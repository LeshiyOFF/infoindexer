"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformHealthCheckService = void 0;
const health_check_dto_1 = require("../domain/dto/health-check.dto");
/**
 * Health Check Service
 *
 * @remarks
 * Реализует IHealthCheck порт.
 * Проверяет критические компоненты системы.
 */
class TransformHealthCheckService {
    clickhouse;
    memoryMonitor;
    checkers;
    constructor(clickhouse, memoryMonitor) {
        this.clickhouse = clickhouse;
        this.memoryMonitor = memoryMonitor;
        this.checkers = new Map();
        this.registerDefaultCheckers();
    }
    /**
     * Проверить здоровье всех компонентов
     *
     * @remarks
     * Выполняет все зарегистрированные проверки параллельно.
     *
     * @returns Агрегированный результат health check
     */
    async check() {
        const checkerEntries = Array.from(this.checkers.entries());
        // Параллельное выполнение всех проверок
        const results = await Promise.all(checkerEntries.map(async ([name, checker]) => {
            try {
                return await checker();
            }
            catch (error) {
                return health_check_dto_1.HealthCheckDto.unhealthy(name, 0, error instanceof Error ? error : String(error));
            }
        }));
        return health_check_dto_1.HealthCheckDto.systemResult(results);
    }
    /**
     * Проверить здоровье конкретного компонента
     *
     * @param name - Имя компонента
     * @returns Результат health check компонента
     */
    async checkComponent(name) {
        const checker = this.checkers.get(name);
        if (!checker) {
            throw new Error(`Component checker not found: ${name}`);
        }
        try {
            return await checker();
        }
        catch (error) {
            return health_check_dto_1.HealthCheckDto.unhealthy(name, 0, error instanceof Error ? error : String(error));
        }
    }
    /**
     * Зарегистрировать компонент для проверки
     *
     * @param name - Уникальное имя компонента
     * @param checker - Функция проверки компонента
     */
    register(name, checker) {
        if (this.checkers.has(name)) {
            throw new Error(`Component already registered: ${name}`);
        }
        this.checkers.set(name, checker);
    }
    /**
     * Зарегистрировать checker'ы по умолчанию
     *
     * @remarks
     * Регистрирует проверки для ClickHouse, Redis, Memory.
     */
    registerDefaultCheckers() {
        this.register('clickhouse', this.checkClickHouse.bind(this));
        this.register('memory', this.checkMemory.bind(this));
    }
    /**
     * Проверить ClickHouse
     *
     * @returns Результат проверки
     */
    async checkClickHouse() {
        const start = Date.now();
        try {
            const result = await this.clickhouse.query({
                query: 'SELECT 1',
                format: 'JSONEachRow'
            });
            // Consuming the result to ensure query executed
            await result.text();
            return health_check_dto_1.HealthCheckDto.healthy('clickhouse', Date.now() - start);
        }
        catch (error) {
            return health_check_dto_1.HealthCheckDto.unhealthy('clickhouse', Date.now() - start, error instanceof Error ? error : String(error));
        }
    }
    /**
     * Проверить память
     *
     * @remarks
     * Проверяет доступность памяти и использование.
     *
     * @returns Результат проверки
     */
    async checkMemory() {
        const start = Date.now();
        try {
            const snapshot = await this.memoryMonitor.getMemorySnapshot();
            const duration = Date.now() - start;
            // Статус зависит от использования памяти
            if (snapshot.usagePercent > 90) {
                return health_check_dto_1.HealthCheckDto.degraded('memory', duration, `High memory usage: ${snapshot.usagePercent.toFixed(1)}%`, {
                    used_mb: Math.round(snapshot.usedBytes / 1024 / 1024),
                    available_mb: Math.round(snapshot.availableBytes / 1024 / 1024),
                    usage_percent: Math.round(snapshot.usagePercent)
                });
            }
            return health_check_dto_1.HealthCheckDto.healthy('memory', duration, {
                used_mb: Math.round(snapshot.usedBytes / 1024 / 1024),
                available_mb: Math.round(snapshot.availableBytes / 1024 / 1024),
                usage_percent: Math.round(snapshot.usagePercent)
            });
        }
        catch (error) {
            return health_check_dto_1.HealthCheckDto.unhealthy('memory', Date.now() - start, error instanceof Error ? error : String(error));
        }
    }
}
exports.TransformHealthCheckService = TransformHealthCheckService;
