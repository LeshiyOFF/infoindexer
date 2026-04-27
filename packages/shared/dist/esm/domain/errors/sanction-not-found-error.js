/**
 * Ошибка: санкция не найдена
 */
import { DomainError } from '../domain-error';
export class SanctionNotFoundError extends DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'SanctionNotFoundError';
    }
}
