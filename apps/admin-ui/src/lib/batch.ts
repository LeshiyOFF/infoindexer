/**
 * Константы для функционала батчей
 *
 * @remarks
 * Содержит ключи для sessionStorage и CSS классы для UI элементов.
 */

/**
 * Ключ для хранения элементов батча в sessionStorage
 */
export const BATCH_STORAGE_KEY = 'org-batch-items' as const;

/**
 * CSS класс для элемента навигации с бейджем батча
 * Используется для нахождения цели анимации полёта иконки
 */
export const BATCH_NAV_BADGE_CLASS = 'batch-nav-badge-target' as const;
