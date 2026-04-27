/**
 * Ошибка валидации URL
 */
import { DomainError } from '../domain-error';
export declare class InvalidUrlError extends DomainError {
    constructor(message: string, context: Readonly<Record<string, unknown>>);
}
