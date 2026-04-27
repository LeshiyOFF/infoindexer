/**
 * Ошибка парсинга FTM entity
 */

import { DomainError } from '../domain-error';

export class EntityParseError extends DomainError {
  constructor(message: string, context: Readonly<Record<string, unknown>>) {
    super(message, context);
    this.name = 'EntityParseError';
  }
}
