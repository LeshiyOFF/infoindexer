/**
 * Ошибка валидации санкционной программы
 */
import { DomainError } from '../domain-error';
export declare class InvalidSanctionProgramError extends DomainError {
    constructor(message: string, context: Readonly<Record<string, unknown>>);
}
