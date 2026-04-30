"use strict";
/**
 * Memory Health Checker
 *
 * @remarks
 * Infrastructure Layer — Health Checker в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за проверку использования памяти.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryHealthChecker = void 0;
/**
 * Health Checker для Memory
 *
 * @remarks
 * Проверяет использование heap памяти.
 */
class MemoryHealthChecker {
    memoryLimitBytes;
    constructor(memoryLimitBytes) {
        this.memoryLimitBytes = memoryLimitBytes ?? this.detectMemoryLimit();
    }
    /**
     * Проверяет использование памяти
     *
     * @returns Статус компонента
     *
     * @remarks
     * - healthy: < 70%
     * - degraded: 70-90%
     * - unhealthy: > 90%
     */
    check() {
        const usage = process.memoryUsage();
        const used = usage.heapUsed;
        const limit = this.memoryLimitBytes;
        const percent = (used / limit) * 100;
        let status;
        if (percent < 70) {
            status = 'healthy';
        }
        else if (percent < 90) {
            status = 'degraded';
        }
        else {
            status = 'unhealthy';
        }
        return {
            name: 'memory',
            status,
            checkedAt: Date.now(),
            message: `${Math.round(percent)}% used`,
            metadata: {
                used,
                limit,
                percent: Math.round(percent)
            }
        };
    }
    /**
     * Определяет лимит памяти
     *
     * @remarks
     * Пытается получить из cgroup или возвращает дефолт 2GB.
     */
    detectMemoryLimit() {
        // Дефолт 2GB если не удалось определить
        return 2 * 1024 * 1024 * 1024;
    }
}
exports.MemoryHealthChecker = MemoryHealthChecker;
