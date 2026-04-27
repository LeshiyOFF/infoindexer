/**
 * Rate Limit Type
 *
 * @remarks
 * Domain Layer: Type для типа rate limit.
 * Определяет категорию запроса для применения соответствующих лимитов.
 *
 * Architecture:
 * - Domain Layer: type definition
 * - Discriminated union для type safety
 *
 * Iteration 14: Rate Limiting
 */
/**
 * Тип rate limit
 *
 * @remarks
 * - search: поисковые запросы (организации, санкции)
 * - default: стандартные запросы
 * - sync: синхронизация данных
 */
export type RateLimitType = 'search' | 'default' | 'sync';
