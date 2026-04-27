/**
 * Ошибка небезопасного URL (не в whitelist)
 */
import { DomainError } from '../domain-error';
export declare class UnsafeUrlError extends DomainError {
    constructor(message: string, context: Readonly<Record<string, unknown>>);
}
