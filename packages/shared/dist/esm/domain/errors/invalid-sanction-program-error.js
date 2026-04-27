/**
 * Ошибка валидации санкционной программы
 */
import { DomainError } from '../domain-error';
export class InvalidSanctionProgramError extends DomainError {
    constructor(message, context) {
        super(message, context);
        this.name = 'InvalidSanctionProgramError';
    }
}
