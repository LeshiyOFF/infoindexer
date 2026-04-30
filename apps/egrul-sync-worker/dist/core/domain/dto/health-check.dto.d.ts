/**
 * Health Check DTO Factory
 *
 * @remarks
 * Factory methods for creating health check results.
 * Uses existing types from domain/types/health.types to avoid duplication.
 *
 * @pattern Factory Pattern
 * @pattern Value Object
 * @pattern DRY
 */
import type { ComponentHealth } from '../types/health.types';
import type { SystemHealthResult } from '../ports/i-health-check.port';
/**
 * Health Check Factory
 *
 * @remarks
 * Factory methods for creating health check DTOs.
 * Ensures immutability and validates input.
 */
export declare class HealthCheckDto {
    /**
     * Создать результат проверки компонента (успешно)
     *
     * @param name - Имя компонента
     * @param durationMs - Длительность проверки
     * @param metadata - Опциональные метаданные
     * @returns Immutable ComponentHealth
     */
    static healthy(name: string, durationMs: number, metadata?: Record<string, string | number>): ComponentHealth;
    /**
     * Создать результат проверки компонента (degraded)
     *
     * @param name - Имя компонента
     * @param durationMs - Длительность проверки
     * @param message - Сообщение о деградации
     * @param metadata - Опциональные метаданные
     * @returns Immutable ComponentHealth
     */
    static degraded(name: string, durationMs: number, message: string, metadata?: Record<string, string | number>): ComponentHealth;
    /**
     * Создать результат проверки компонента (ошибка)
     *
     * @param name - Имя компонента
     * @param durationMs - Длительность проверки
     * @param error - Ошибка или сообщение
     * @param metadata - Опциональные метаданные
     * @returns Immutable ComponentHealth
     */
    static unhealthy(name: string, durationMs: number, error: string | Error, metadata?: Record<string, string | number>): ComponentHealth;
    /**
     * Создать агрегированный результат health check
     *
     * @param components - Результаты по компонентам
     * @param checkedAt - Время проверки (по умолчанию сейчас)
     * @returns Immutable SystemHealthResult
     */
    static systemResult(components: readonly ComponentHealth[], checkedAt?: Date): SystemHealthResult;
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
    private static aggregateStatus;
}
