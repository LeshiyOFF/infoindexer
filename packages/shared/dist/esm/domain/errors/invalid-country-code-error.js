/**
 * Ошибка валидации кода страны
 */
import { DomainError } from '../domain-error';
export class InvalidCountryCodeError extends DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidCountryCodeError';
    }
}
