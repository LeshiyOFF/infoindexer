/**
 * Country Code Value Object
 *
 * ISO 3166-1 alpha-2 country code
 *
 * @example
 * ```ts
 * const eu = CountryCode.create('EU');  // ok
 * const xx = CountryCode.create('XX');  // throws InvalidCountryCodeError
 * ```
 */
export declare class CountryCode {
    private readonly code;
    private static readonly VALID;
    private constructor();
    /**
     * Создаёт CountryCode с валидацией
     *
     * @throws InvalidCountryCodeError если код невалиден
     */
    static create(code: string): CountryCode;
    /**
     * Возвращает код в нижнем регистре
     */
    get value(): string;
    /**
     * Value Objects equality: два кода равны если значения совпадают
     */
    equals(other: CountryCode): boolean;
    toString(): string;
}
