/**
 * Factory для Circuit Breaker Configuration
 *
 * @remarks
 * Domain Layer — Factory в Hexagonal Architecture.
 * Создаёт преднастроенные конфигурации для разных случаев.
 *
 * Следует SRP: ответственен только за создание конфигураций.
 */
import { CircuitBreakerConfigVO } from '../value-objects/circuit-breaker-config.vo';
/**
 * Factory для Circuit Breaker Configuration
 *
 * @remarks
 * Предоставляет преднастроенные конфигурации для разных сценариев.
 */
export declare class CircuitBreakerConfigFactory {
    /**
     * Создаёт конфигурацию по умолчанию
     *
     * @returns Конфигурация со сбалансированными параметрами
     */
    static default(): CircuitBreakerConfigVO;
    /**
     * Создаёт строгою конфигурацию
     *
     * @returns Конфигурация с низкими порогами и длинными таймаутами
     *
     * @remarks
     * Используется для критических систем где нужен быстрый failover.
     */
    static strict(): CircuitBreakerConfigVO;
    /**
     * Создаёт мягкую конфигурацию
     *
     * @returns Конфигурация с высокими порогами и короткими таймаутами
     *
     * @remarks
     * Используется для менее критичных систем где допустимы retry.
     */
    static lenient(): CircuitBreakerConfigVO;
    /**
     * Создаёт конфигурацию для внешних API
     *
     * @returns Конфигурация оптимизированная для внешних API
     *
     * @remarks
     * Баланс между надёжностью и скоростью восстановления.
     */
    static forExternalAPI(): CircuitBreakerConfigVO;
    /**
     * Создаёт конфигурацию для баз данных
     *
     * @returns Конфигурация оптимизированная для баз данных
     *
     * @remarks
     * Низкий порог неудач, быстрый half-open, мало вызовов в half-open.
     */
    static forDatabase(): CircuitBreakerConfigVO;
    /**
     * Создаёт оптимальную конфигурацию для количества записей
     *
     * @param recordCount - Количество записей
     * @returns Конфигурация с оптимальными параметрами
     *
     * @remarks
     * Подстраивает batch size под количество записей.
     */
    static optimalFor(recordCount: number): CircuitBreakerConfigVO;
}
/**
 * Алиас для обратной совместимости
 *
 * @deprecated Используйте CircuitBreakerConfigFactory
 */
export declare const CBConfigFactory: typeof CircuitBreakerConfigFactory;
