/**
 * Ошибка: ИНН не найден
 */
import { DomainError } from '../domain-error';
export declare class InnNotFoundError extends DomainError {
    constructor(message: string, context: Readonly<Record<string, unknown>>);
}
