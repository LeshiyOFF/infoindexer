/**
 * Ошибка: ИНН не найден
 */
import { DomainError } from '../domain-error';
export class InnNotFoundError extends DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InnNotFoundError';
    }
}
