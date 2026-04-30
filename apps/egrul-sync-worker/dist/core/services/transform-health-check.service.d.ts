/**
 * Transform Health Check Service
 *
 * @remarks
 * Сервис для проверки здоровья transform операций.
 * Следует SRP: только проверка, не лечение.
 * Следует DIP: зависит от портов, не от конкретных адаптеров.
 *
 * @pattern Single Responsibility Principle
 * @pattern Dependency Inversion Principle
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IHealthCheck, SystemHealthResult } from '../domain/ports/i-health-check.port';
import type { ComponentHealth } from '../domain/types/health.types';
import type { IMemoryMonitor } from '../domain/ports/i-memory-monitor.port';
/**
 * Health Check Service
 *
 * @remarks
 * Реализует IHealthCheck порт.
 * Проверяет критические компоненты системы.
 */
export declare class TransformHealthCheckService implements IHealthCheck {
    private readonly clickhouse;
    private readonly memoryMonitor;
    private readonly checkers;
    constructor(clickhouse: ClickHouseClient, memoryMonitor: IMemoryMonitor);
    /**
     * Проверить здоровье всех компонентов
     *
     * @remarks
     * Выполняет все зарегистрированные проверки параллельно.
     *
     * @returns Агрегированный результат health check
     */
    check(): Promise<SystemHealthResult>;
    /**
     * Проверить здоровье конкретного компонента
     *
     * @param name - Имя компонента
     * @returns Результат health check компонента
     */
    checkComponent(name: string): Promise<ComponentHealth>;
    /**
     * Зарегистрировать компонент для проверки
     *
     * @param name - Уникальное имя компонента
     * @param checker - Функция проверки компонента
     */
    register(name: string, checker: () => Promise<ComponentHealth>): void;
    /**
     * Зарегистрировать checker'ы по умолчанию
     *
     * @remarks
     * Регистрирует проверки для ClickHouse, Redis, Memory.
     */
    private registerDefaultCheckers;
    /**
     * Проверить ClickHouse
     *
     * @returns Результат проверки
     */
    private checkClickHouse;
    /**
     * Проверить память
     *
     * @remarks
     * Проверяет доступность памяти и использование.
     *
     * @returns Результат проверки
     */
    private checkMemory;
}
