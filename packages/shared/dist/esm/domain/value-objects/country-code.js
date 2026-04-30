"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryCode = void 0;
const errors_1 = require("../errors");
class CountryCode {
    code;
    static VALID = new Set([
        'eu', // European Union
        'us', // United States
        'gb', // United Kingdom
        'un', // United Nations
        'au', // Australia
        'ca', // Canada
        'ch', // Switzerland
        'jp', // Japan
        'nz' // New Zealand
    ]);
    constructor(code) {
        this.code = code;
    }
    /**
     * Создаёт CountryCode с валидацией
     *
     * @throws InvalidCountryCodeError если код невалиден
     */
    static create(code) {
        const normalized = code.toLowerCase().trim();
        if (normalized.length !== 2) {
            throw new errors_1.InvalidCountryCodeError('Country code must be 2 characters', {
                code,
                normalized
            });
        }
        if (!CountryCode.VALID.has(normalized)) {
            throw new errors_1.InvalidCountryCodeError('Invalid country code', {
                code,
                normalized,
                validCodes: Array.from(CountryCode.VALID)
            });
        }
        return new CountryCode(normalized);
    }
    /**
     * Возвращает код в нижнем регистре
     */
    get value() {
        return this.code;
    }
    /**
     * Value Objects equality: два кода равны если значения совпадают
     */
    equals(other) {
        return this.code === other.code;
    }
    toString() {
        return this.code.toUpperCase();
    }
}
exports.CountryCode = CountryCode;
