/**
 * Ошибка: ИНН не найден
 */

import { DomainError } from '../domain-error';

export class InnNotFoundError extends DomainError {
  constructor(message: string, context: Readonly<Record<string, unknown>>) {
    super(message, context);
    this.name = 'InnNotFoundError';
  }
}
