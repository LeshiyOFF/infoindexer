/**
 * Ошибка валидации периода санкции
 */
import { DomainError } from '../domain-error';
export declare class InvalidPeriodError extends DomainError {
    constructor(message: string, context: Readonly<Record<string, unknown>>);
}
