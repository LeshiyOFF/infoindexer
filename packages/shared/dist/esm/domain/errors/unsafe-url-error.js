/**
 * Ошибка небезопасного URL (не в whitelist)
 */
import { DomainError } from '../domain-error';
export class UnsafeUrlError extends DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'UnsafeUrlError';
    }
}
