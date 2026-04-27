/**
 * Ошибка валидации ИНН
 */

import { DomainError } from '../domain-error';

export class InvalidInnError extends DomainError {
  constructor(message: string, context: Readonly<Record<string, unknown>>) {
    super(message, context);
    this.name = 'InvalidInnError';
  }
}
