/**
 * Ошибка валидации URL
 */
import { DomainError } from '../domain-error';
export class InvalidUrlError extends DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidUrlError';
    }
}
