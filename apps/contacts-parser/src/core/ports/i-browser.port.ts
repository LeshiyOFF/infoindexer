/**
 * Port для работы с браузером
 *
 * @remarks
 * Определяет контракт для управления браузером.
 * Реализует Dependency Inversion Principle из SOLID.
 */

import type { Browser, BrowserContext } from 'playwright';

/** Параметры контекста браузера */
export interface BrowserContextOptions {
  readonly userAgent?: string;
}

/**
 * Port для управления браузером
 *
 * @remarks
 * Определяет методы для создания и управления браузером.
 * Позволяет менять реализацию без изменения бизнес-логики.
 */
export interface IBrowserService {
  /**
   * Получает или создаёт экземпляр браузера
   *
   * @returns Экземпляр браузера
   */
  getBrowser(): Promise<Browser>;

  /**
   * Создаёт новый контекст браузера
   *
   * @param options - Параметры контекста
   * @returns Новый контекст браузера
   */
  createContext(options?: BrowserContextOptions): Promise<BrowserContext>;

  /**
   * Закрывает браузер
   */
  close(): Promise<void>;
}
