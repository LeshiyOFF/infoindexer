"use strict";
/**
 * Константы для OSINT Waterfall Enricher
 *
 * @remarks
 * Централизованное хранилище всех констант приложения.
 * Следует принципу DRY - нет дублирования в коде.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TARGET_PAGE_TIMEOUT_MS = exports.PAGE_TIMEOUT_MS = exports.PARSE_CONCURRENCY = exports.BATCH_TTL_SEC = exports.BLOCKED_EMAIL_DOMAINS = exports.BLOCKED_EMAILS = exports.BLOCKED_DOMAINS = exports.TARGET_PAGE_DELAY_MS = exports.TARGET_PAGES_MAX = void 0;
/** Максимум целевых страниц на один поисковый запрос */
exports.TARGET_PAGES_MAX = 5;
/** Задержка между переходами на целевые страницы (мс) */
exports.TARGET_PAGE_DELAY_MS = 1500;
/** Домены, на которые не переходим */
exports.BLOCKED_DOMAINS = ['checko.ru', 'rusprofile.ru', 'sbis.ru', 'duckduckgo.com'];
/** Почты-плейсхолдеры и обратной связи агрегаторов — не личные контакты директора */
exports.BLOCKED_EMAILS = [
    'sentry', 'wix', 'example', 'noreply', 'no-reply', 'donotreply',
    'companycardsfeedback', 'cardsfeedback', 'feedback@rbc',
    'mailer-daemon', 'postmaster', 'abuse@', 'webmaster@',
    'duckduckgo', 'error-lite', 'sales_support@interfax'
];
/** Домены email, которые всегда считаются мусором (DDG, примеры и т.п.) */
exports.BLOCKED_EMAIL_DOMAINS = ['duckduckgo.com', 'example.com', 'test.com'];
/** Время жизни батча в Redis (секунды) */
exports.BATCH_TTL_SEC = 7 * 24 * 60 * 60;
/** Количество параллельно обрабатываемых ИНН */
exports.PARSE_CONCURRENCY = 3;
/** Таймаут для операций страницы (мс) */
exports.PAGE_TIMEOUT_MS = 15000;
/** Таймаут для загрузки целевой страницы (мс) */
exports.TARGET_PAGE_TIMEOUT_MS = 10000;
