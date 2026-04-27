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
export class RateLimitConfig {
  private static readonly CONFIGS: Readonly<Record<RateLimitType, LimitConfig>> = {
    search: { requests: 100, window: 60 },
    default: { requests: 200, window: 60 },
    sync: { requests: 20, window: 60 }
  } as const;

  private constructor(
    private readonly type: RateLimitType,
    private readonly config: LimitConfig
  ) {}

  /**
   * Получить конфиг для типа
   *
   * @param type - Тип лимита
   * @returns LimitConfig
   */
  static get(type: RateLimitType): LimitConfig {
    return RateLimitConfig.CONFIGS[type];
  }

  /**
   * Получить все конфиги
   *
   * @returns Record с всеми конфигами
   */
  static getAll(): Readonly<Record<RateLimitType, LimitConfig>> {
    return RateLimitConfig.CONFIGS;
  }

  /**
   * Создать инстанс для конкретного типа
   *
   * @param type - Тип лимита
   * @returns RateLimitConfig
   */
  static forType(type: RateLimitType): RateLimitConfig {
    return new RateLimitConfig(type, RateLimitConfig.CONFIGS[type]);
  }

  /**
   * Получить тип
   */
  getType(): RateLimitType {
    return this.type;
  }

  /**
   * Получить максимальное количество запросов
   */
  getRequests(): number {
    return this.config.requests;
  }

  /**
   * Получить окно в секундах
   */
  getWindow(): number {
    return this.config.window;
  }

  /**
   * Получить полное значение конфига
   */
  getValue(): LimitConfig {
    return this.config;
  }
}

/**
 * Синглтон с константами для удобства импорта
 */
export const RATE_LIMITS = RateLimitConfig.getAll();
