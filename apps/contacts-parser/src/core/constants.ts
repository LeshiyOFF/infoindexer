/**
 * Константы для OSINT Waterfall Enricher
 *
 * @remarks
 * Централизованное хранилище всех констант приложения.
 * Следует принципу DRY - нет дублирования в коде.
 */

/** Максимум целевых страниц на один поисковый запрос */
export const TARGET_PAGES_MAX = 5;

/** Задержка между переходами на целевые страницы (мс) */
export const TARGET_PAGE_DELAY_MS = 1500;

/** Домены, на которые не переходим */
export const BLOCKED_DOMAINS = ['checko.ru', 'rusprofile.ru', 'sbis.ru', 'duckduckgo.com'] as const;

/** Тип заблокированного домена */
export type BlockedDomain = typeof BLOCKED_DOMAINS[number];

/** Почты-плейсхолдеры и обратной связи агрегаторов — не личные контакты директора */
export const BLOCKED_EMAILS = [
  'sentry', 'wix', 'example', 'noreply', 'no-reply', 'donotreply',
  'companycardsfeedback', 'cardsfeedback', 'feedback@rbc',
  'mailer-daemon', 'postmaster', 'abuse@', 'webmaster@',
  'duckduckgo', 'error-lite', 'sales_support@interfax'
] as const;

/** Тип заблокированного email шаблона */
export type BlockedEmailPattern = typeof BLOCKED_EMAILS[number];

/** Домены email, которые всегда считаются мусором (DDG, примеры и т.п.) */
export const BLOCKED_EMAIL_DOMAINS = ['duckduckgo.com', 'example.com', 'test.com'] as const;

/** Тип заблокированного email домена */
export type BlockedEmailDomain = typeof BLOCKED_EMAIL_DOMAINS[number];

/** Время жизни батча в Redis (секунды) */
export const BATCH_TTL_SEC = 7 * 24 * 60 * 60;

/** Количество параллельно обрабатываемых ИНН */
export const PARSE_CONCURRENCY = 3;

/** Таймаут для операций страницы (мс) */
export const PAGE_TIMEOUT_MS = 15000;

/** Таймаут для загрузки целевой страницы (мс) */
export const TARGET_PAGE_TIMEOUT_MS = 10000;
