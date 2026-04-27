/**
 * DTO для команды отмены операции
 *
 * @remarks
 * Value Object для передачи команды отмены через Redis Pub/Sub.
 */

import type { AbortOperationType } from '../../infrastructure/ports/abort.port';

/**
 * Команда отмены операции
 */
export interface AbortCommand {
  readonly operationId: string;
  readonly operationType: AbortOperationType;
  readonly timestamp: number;
  readonly userId?: string;
}

/**
 * Создаёт команду отмены
 */
export function createAbortCommand(
  operationId: string,
  operationType: AbortOperationType,
  userId?: string
): AbortCommand {
  return {
    operationId,
    operationType,
    timestamp: Date.now(),
    userId
  };
}

/**
 * Сериализует команду в JSON
 */
export function serializeAbortCommand(command: AbortCommand): string {
  return JSON.stringify(command);
}

/**
 * Десериализует команду из JSON
 */
export function deserializeAbortCommand(data: string): AbortCommand {
  try {
    const parsed = JSON.parse(data) as unknown;
    return validateAbortCommand(parsed);
  } catch {
    throw new Error('Invalid AbortCommand format');
  }
}

/**
 * Валидирует структуру команды отмены
 */
function validateAbortCommand(data: unknown): AbortCommand {
  if (typeof data !== 'object' || data === null) {
    throw new Error('AbortCommand must be an object');
  }

  const cmd = data as Record<string, unknown>;

  if (typeof cmd.operationId !== 'string') {
    throw new Error('AbortCommand.operationId must be a string');
  }

  if (typeof cmd.operationType !== 'string') {
    throw new Error('AbortCommand.operationType must be a string');
  }

  if (typeof cmd.timestamp !== 'number') {
    throw new Error('AbortCommand.timestamp must be a number');
  }

  return {
    operationId: cmd.operationId,
    operationType: cmd.operationType as AbortOperationType,
    timestamp: cmd.timestamp,
    userId: typeof cmd.userId === 'string' ? cmd.userId : undefined
  };
}
