/**
 * Value Object для результата отмены
 *
 * @remarks
 * Имутабельный объект результата операции отмены.
 */

/**
 * Статус выполнения отмены
 */
export type AbortStatus = 'success' | 'failed' | 'not_found';

/**
 * Результат операции отмены
 */
export interface AbortResult {
  readonly status: AbortStatus;
  readonly operationId: string;
  readonly message?: string;
  readonly error?: string;
  readonly rowsDeleted?: number;
}

/**
 * Создаёт успешный результат отмены
 */
export function abortSuccess(operationId: string, rowsDeleted?: number): AbortResult {
  return {
    status: 'success',
    operationId,
    message: rowsDeleted !== undefined
      ? `Операция отменена. Удалено записей: ${rowsDeleted}`
      : 'Операция отменена',
    rowsDeleted
  };
}

/**
 * Создаёт результат "операция не найдена"
 */
export function abortNotFound(operationId: string): AbortResult {
  return {
    status: 'not_found',
    operationId,
    message: 'Операция не найдена'
  };
}

/**
 * Создаёт результат с ошибкой
 */
export function abortFailed(operationId: string, error: string): AbortResult {
  return {
    status: 'failed',
    operationId,
    error
  };
}

/**
 * Проверяет, успешна ли отмена
 */
export function isAbortSuccess(result: AbortResult): boolean {
  return result.status === 'success';
}

/**
 * Проверяет, что операция не найдена
 */
export function isAbortNotFound(result: AbortResult): boolean {
  return result.status === 'not_found';
}
