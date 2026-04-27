/**
 * Константы для модуля организаций
 *
 * @remarks
 * Содержит ключи для sessionStorage, лимиты и значения по умолчанию для фильтров.
 */

/** Ключ для персистентности фильтров в sessionStorage */
export const FILTERS_PERSIST_KEY = 'org-filters-persist' as const;

/** Ключ для сохранения видимости фильтров в sessionStorage */
export const SHOW_FILTERS_KEY = 'org-show-filters' as const;

/** Максимальное значение выручки для фильтра (в тыс. ₽) */
export const REVENUE_MAX = 10_000 as const;

/** Максимальное значение возраста компании для фильтра (в годах) */
export const AGE_MAX = 50 as const;

/** Количество элементов на странице */
export const PAGE_LIMIT = 50 as const;

/** Задержка дебаунса для поиска (мс) */
export const SEARCH_DEBOUNCE_MS = 400 as const;

/** Минимальная задержка загрузки для UI (мс) */
export const MIN_LOADING_TIME_MS = 220 as const;
