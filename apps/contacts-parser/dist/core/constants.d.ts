/**
 * Константы для OSINT Waterfall Enricher
 *
 * @remarks
 * Централизованное хранилище всех констант приложения.
 * Следует принципу DRY - нет дублирования в коде.
 */
/** Максимум целевых страниц на один поисковый запрос */
export declare const TARGET_PAGES_MAX = 5;
/** Задержка между переходами на целевые страницы (мс) */
export declare const TARGET_PAGE_DELAY_MS = 1500;
/** Домены, на которые не переходим */
export declare const BLOCKED_DOMAINS: readonly ["checko.ru", "rusprofile.ru", "sbis.ru", "duckduckgo.com"];
/** Тип заблокированного домена */
export type BlockedDomain = typeof BLOCKED_DOMAINS[number];
/** Почты-плейсхолдеры и обратной связи агрегаторов — не личные контакты директора */
export declare const BLOCKED_EMAILS: readonly ["sentry", "wix", "example", "noreply", "no-reply", "donotreply", "companycardsfeedback", "cardsfeedback", "feedback@rbc", "mailer-daemon", "postmaster", "abuse@", "webmaster@", "duckduckgo", "error-lite", "sales_support@interfax"];
/** Тип заблокированного email шаблона */
export type BlockedEmailPattern = typeof BLOCKED_EMAILS[number];
/** Домены email, которые всегда считаются мусором (DDG, примеры и т.п.) */
export declare const BLOCKED_EMAIL_DOMAINS: readonly ["duckduckgo.com", "example.com", "test.com"];
/** Тип заблокированного email домена */
export type BlockedEmailDomain = typeof BLOCKED_EMAIL_DOMAINS[number];
/** Время жизни батча в Redis (секунды) */
export declare const BATCH_TTL_SEC: number;
/** Количество параллельно обрабатываемых ИНН */
export declare const PARSE_CONCURRENCY = 3;
/** Таймаут для операций страницы (мс) */
export declare const PAGE_TIMEOUT_MS = 15000;
/** Таймаут для загрузки целевой страницы (мс) */
export declare const TARGET_PAGE_TIMEOUT_MS = 10000;
