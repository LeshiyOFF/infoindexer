/**
 * Ошибка валидации ИНН
 */
import { DomainError } from '../domain-error';
export declare class InvalidInnError extends DomainError {
    constructor(message: string, context: Readonly<Record<string, unknown>>);
}
