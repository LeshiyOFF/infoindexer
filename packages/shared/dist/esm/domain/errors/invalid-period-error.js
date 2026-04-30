/**
 * Ошибка валидации периода санкции
 */
import { DomainError } from '../domain-error';
export class InvalidPeriodError extends DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidPeriodError';
    }
}
