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
/**
 * Rate Limit Configuration
 *
 * @remarks
 * Value Object с readonly полями.
 * Содержит лимиты для всех типов запросов.
 */
export class RateLimitConfig {
    type;
    config;
    static CONFIGS = {
        search: { requests: 100, window: 60 },
        default: { requests: 200, window: 60 },
        sync: { requests: 20, window: 60 }
    };
    constructor(type, config) {
        this.type = type;
        this.config = config;
    }
    /**
     * Получить конфиг для типа
     *
     * @param type - Тип лимита
     * @returns LimitConfig
     */
    static get(type) {
        return RateLimitConfig.CONFIGS[type];
    }
    /**
     * Получить все конфиги
     *
     * @returns Record с всеми конфигами
     */
    static getAll() {
        return RateLimitConfig.CONFIGS;
    }
    /**
     * Создать инстанс для конкретного типа
     *
     * @param type - Тип лимита
     * @returns RateLimitConfig
     */
    static forType(type) {
        return new RateLimitConfig(type, RateLimitConfig.CONFIGS[type]);
    }
    /**
     * Получить тип
     */
    getType() {
        return this.type;
    }
    /**
     * Получить максимальное количество запросов
     */
    getRequests() {
        return this.config.requests;
    }
    /**
     * Получить окно в секундах
     */
    getWindow() {
        return this.config.window;
    }
    /**
     * Получить полное значение конфига
     */
    getValue() {
        return this.config;
    }
}
/**
 * Синглтон с константами для удобства импорта
 */
export const RATE_LIMITS = RateLimitConfig.getAll();
