/**
 * Ошибка: санкция не найдена
 */
import { DomainError } from '../domain-error';
export declare class SanctionNotFoundError extends DomainError {
    constructor(message: string, context: Readonly<Record<string, unknown>>);
}
