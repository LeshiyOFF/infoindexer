/**
 * Менеджер активных операций API
 *
 * @remarks
 * Управляет AbortController для операций выполняемых в фоне в API routes.
 * Следует SRP: отвечает только за управление жизненным циклом операций.
 */

interface ActiveOperation {
  readonly controller: AbortController;
  readonly startTime: number;
}

/**
 * Менеджер активных операций
 */
class ActiveOperationsManager {
  private readonly operations = new Map<string, ActiveOperation>();

  /**
   * Регистрирует новую операцию
   *
   * @returns Контроллер для прерывания
   */
  register(operationId: string): AbortController {
    // Если операция уже существует, прерываем её
    const existing = this.operations.get(operationId);
    if (existing) {
      existing.controller.abort();
    }

    const controller = new AbortController();
    this.operations.set(operationId, {
      controller,
      startTime: Date.now()
    });
    return controller;
  }

  /**
   * Удаляет операцию из активных
   */
  unregister(operationId: string): void {
    this.operations.delete(operationId);
  }

  /**
   * Прерывает операцию
   */
  abort(operationId: string): boolean {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.controller.abort();
      this.operations.delete(operationId);
      return true;
    }
    return false;
  }

  /**
   * Получает AbortSignal для операции
   */
  getSignal(operationId: string): AbortSignal | undefined {
    return this.operations.get(operationId)?.controller.signal;
  }

  /**
   * Проверяет выполняется ли операция
   */
  isActive(operationId: string): boolean {
    return this.operations.has(operationId);
  }
}

// Singleton экспорт
export const activeOperations = new ActiveOperationsManager();
