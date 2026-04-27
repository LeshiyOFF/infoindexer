/**
 * Ошибка валидации кода страны
 */

import { DomainError } from '../domain-error';

export class InvalidCountryCodeError extends DomainError {
  constructor(message: string, context: Readonly<Record<string, unknown>>) {
    super(message, context);
    this.name = 'InvalidCountryCodeError';
  }
}
