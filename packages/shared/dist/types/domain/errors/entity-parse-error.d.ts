/**
 * Ошибка парсинга FTM entity
 */
import { DomainError } from '../domain-error';
export declare class EntityParseError extends DomainError {
    constructor(message: string, context: Readonly<Record<string, unknown>>);
}
