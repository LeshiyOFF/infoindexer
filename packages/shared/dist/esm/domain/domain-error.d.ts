/**
 * Domain Error Base Class
 *
 * Базовый класс для всех domain ошибок.
 * Все ошибки содержат контекст для debugging.
 *
 * @example
 * ```ts
 * throw new InvalidCountryCodeError('Invalid code', { code: 'XX', normalized: 'xx' });
 * ```
 */
/**
 * Базовый класс для всех domain ошибок
 */
export declare class DomainError extends Error {
    readonly context: Readonly<Record<string, unknown>>;
    constructor(message: string, context: Readonly<Record<string, unknown>>);
    /**
     * Форматирует ошибку для логирования
     */
    toLog(): string;
}
