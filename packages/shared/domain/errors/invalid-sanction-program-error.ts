/**
 * Ошибка валидации санкционной программы
 */

import { DomainError } from '../domain-error';

export class InvalidSanctionProgramError extends DomainError {
  constructor(message: string, context: Readonly<Record<string, unknown>>) {
    super(message, context);
    this.name = 'InvalidSanctionProgramError';
  }
}
