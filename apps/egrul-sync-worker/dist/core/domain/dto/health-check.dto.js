"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckDto = void 0;
/**
 * Health Check Factory
 *
 * @remarks
 * Factory methods for creating health check DTOs.
 * Ensures immutability and validates input.
 */
class HealthCheckDto {
    /**
     * Создать результат проверки компонента (успешно)
     *
     * @param name - Имя компонента
     * @param durationMs - Длительность проверки
     * @param metadata - Опциональные метаданные
     * @returns Immutable ComponentHealth
     */
    static healthy(name, durationMs, metadata) {
        return Object.freeze({
            name,
            status: 'healthy',
            checkedAt: Date.now(),
            metadata: metadata ? Object.freeze(metadata) : undefined
        });
    }
    /**
     * Создать результат проверки компонента (degraded)
     *
     * @param name - Имя компонента
     * @param durationMs - Длительность проверки
     * @param message - Сообщение о деградации
     * @param metadata - Опциональные метаданные
     * @returns Immutable ComponentHealth
     */
    static degraded(name, durationMs, message, metadata) {
        return Object.freeze({
            name,
            status: 'degraded',
            checkedAt: Date.now(),
            message,
            metadata: metadata ? Object.freeze(metadata) : undefined
        });
    }
    /**
     * Создать результат проверки компонента (ошибка)
     *
     * @param name - Имя компонента
     * @param durationMs - Длительность проверки
     * @param error - Ошибка или сообщение
     * @param metadata - Опциональные метаданные
     * @returns Immutable ComponentHealth
     */
    static unhealthy(name, durationMs, error, metadata) {
        const errorMessage = error instanceof Error ? error.message : error;
        return Object.freeze({
            name,
            status: 'unhealthy',
            checkedAt: Date.now(),
            message: errorMessage,
            metadata: metadata ? Object.freeze(metadata) : undefined
        });
    }
    /**
     * Создать агрегированный результат health check
     *
     * @param components - Результаты по компонентам
     * @param checkedAt - Время проверки (по умолчанию сейчас)
     * @returns Immutable SystemHealthResult
     */
    static systemResult(components, checkedAt = new Date()) {
        const status = this.aggregateStatus(components);
        return Object.freeze({
            status,
            components,
            checkedAt
        });
    }
    /**
     * Агрегировать статус системы из компонентов
     *
     * @remarks
     * Правила агрегации:
     * - Если есть unhealthy → system unhealthy
     * - Если есть degraded → system degraded
     * - Иначе → system healthy
     *
     * @param components - Компоненты системы
     * @returns Агрегированный статус
     */
    static aggregateStatus(components) {
        if (components.some(c => c.status === 'unhealthy')) {
            return 'unhealthy';
        }
        if (components.some(c => c.status === 'degraded')) {
            return 'degraded';
        }
        return 'healthy';
    }
}
exports.HealthCheckDto = HealthCheckDto;
