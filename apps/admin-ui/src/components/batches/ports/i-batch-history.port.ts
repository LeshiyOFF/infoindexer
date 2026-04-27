/**
 * Port для загрузки истории батчей
 *
 * @remarks
 * Hexagonal Architecture: Port interface для доступа к истории батчей.
 * Реализуется адаптерами (HTTP, WebSocket, etc.).
 */

/** Статус батча */
export type BatchStatus = 'pending' | 'running' | 'completed' | 'error' | 'idle';

/** Элемент истории батчей */
export interface BatchHistoryItem {
  readonly batchId: string;
  readonly createdAt: number;
  readonly status: BatchStatus;
  readonly totalCount: number;
  readonly completedCount: number;
  readonly innsCount: number;
}

/** Ответ API с историей батчей */
export interface BatchHistoryResponse {
  readonly items: readonly BatchHistoryItem[];
  readonly total: number;
  readonly totalPages: number;
}

/**
 * Port для загрузки истории батчей
 */
export interface IBatchHistoryPort {
  /**
   * Загружает страницу истории батчей
   *
   * @param page - Номер страницы (начиная с 1)
   * @param limit - Количество элементов на странице
   * @returns Promise с данными истории
   */
  readonly loadHistory: (page: number, limit: number) => Promise<BatchHistoryResponse>;
}
