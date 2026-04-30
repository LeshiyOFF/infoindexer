/**
 * Ошибка парсинга FTM entity
 */
import { DomainError } from '../domain-error';
export class EntityParseError extends DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'EntityParseError';
    }
}
