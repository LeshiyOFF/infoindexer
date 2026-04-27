/**
 * Ошибка валидации кода страны
 */
import { DomainError } from '../domain-error';
export declare class InvalidCountryCodeError extends DomainError {
    constructor(message: string, context: Readonly<Record<string, unknown>>);
}
