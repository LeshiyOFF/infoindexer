/**
 * Predefined Retry Strategies
 */
import { RetryPolicy } from './retry';
/**
 * Предопределённые стратегии retry
 */
export declare const RetryStrategies: {
    /** Быстрый retry для временных сетевых сбоев */
    readonly fast: RetryPolicy;
    /** Стандартный retry для API calls */
    readonly standard: RetryPolicy;
    /** Медленный retry для внешних сервисов */
    readonly slow: RetryPolicy;
    /** Линейный retry */
    readonly linear: RetryPolicy;
};
/** Тип предопределённой стратегии */
export type RetryStrategyName = keyof typeof RetryStrategies;
/**
 * Получает стратегию по имени
 */
export declare function getStrategy(name: RetryStrategyName): RetryPolicy;
