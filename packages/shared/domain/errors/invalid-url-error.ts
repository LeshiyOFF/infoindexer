/**
 * Ошибка валидации URL
 */

import { DomainError } from '../domain-error';

export class InvalidUrlError extends DomainError {
  constructor(message: string, context: Readonly<Record<string, unknown>>) {
    super(message, context);
    this.name = 'InvalidUrlError';
  }
}
