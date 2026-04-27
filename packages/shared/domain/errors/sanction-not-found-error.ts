/**
 * Ошибка: санкция не найдена
 */

import { DomainError } from '../domain-error';

export class SanctionNotFoundError extends DomainError {
  constructor(message: string, context: Readonly<Record<string, unknown>>) {
    super(message, context);
    this.name = 'SanctionNotFoundError';
  }
}
