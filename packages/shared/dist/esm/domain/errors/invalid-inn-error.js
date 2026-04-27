/**
 * Ошибка валидации ИНН
 */
import { DomainError } from '../domain-error';
export class InvalidInnError extends DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidInnError';
    }
}
