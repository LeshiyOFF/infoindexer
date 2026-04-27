/**
 * Secure URL Value Object
 *
 * Secure URL с whitelist проверкой
 *
 * @example
 * ```ts
 * const url = SecureUrl.create('https://eur-lex.europa.eu/...');
 * url.hostname  // 'eur-lex.europa.eu'
 * ```
 */
export declare class SecureUrl {
    private readonly url;
    readonly hostname: string;
    private static readonly ALLOWED_HOSTS;
    private constructor();
    static create(url: string): SecureUrl;
    get value(): string;
    equals(other: SecureUrl): boolean;
    toString(): string;
}
