/**
 * Rate Limit Configuration
 *
 * @remarks
 * Domain Layer: Value Object с readonly конфигурацией лимитов.
 * Единый источник истины для всех rate limit констант.
 *
 * Architecture:
 * - Domain Layer: immutable configuration
 * - SRP: только хранение конфигурации
 * - DRY: одно место для всех лимитов
 *
 * Iteration 14: Rate Limiting
 */
import type { RateLimitType } from './rate-limit-type.type';
/**
 * Конфигурация лимита для одного типа
 *
 * @remarks
 * Readonly для иммутабельности.
 */
export interface LimitConfig {
    /** Максимальное количество запросов */
    readonly requests: number;
    /** Окно в секундах */
    readonly window: number;
}
/**
 * Rate Limit Configuration
 *
 * @remarks
 * Value Object с readonly полями.
 * Содержит лимиты для всех типов запросов.
 */
export declare class RateLimitConfig {
    private readonly type;
    private readonly config;
    private static readonly CONFIGS;
    private constructor();
    /**
     * Получить конфиг для типа
     *
     * @param type - Тип лимита
     * @returns LimitConfig
     */
    static get(type: RateLimitType): LimitConfig;
    /**
     * Получить все конфиги
     *
     * @returns Record с всеми конфигами
     */
    static getAll(): Readonly<Record<RateLimitType, LimitConfig>>;
    /**
     * Создать инстанс для конкретного типа
     *
     * @param type - Тип лимита
     * @returns RateLimitConfig
     */
    static forType(type: RateLimitType): RateLimitConfig;
    /**
     * Получить тип
     */
    getType(): RateLimitType;
    /**
     * Получить максимальное количество запросов
     */
    getRequests(): number;
    /**
     * Получить окно в секундах
     */
    getWindow(): number;
    /**
     * Получить полное значение конфига
     */
    getValue(): LimitConfig;
}
/**
 * Синглтон с константами для удобства импорта
 */
export declare const RATE_LIMITS: Readonly<Record<RateLimitType, LimitConfig>>;
