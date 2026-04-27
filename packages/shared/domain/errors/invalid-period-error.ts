/**
 * Ошибка валидации периода санкции
 */

import { DomainError } from '../domain-error';

export class InvalidPeriodError extends DomainError {
  constructor(message: string, context: Readonly<Record<string, unknown>>) {
    super(message, context);
    this.name = 'InvalidPeriodError';
  }
}
