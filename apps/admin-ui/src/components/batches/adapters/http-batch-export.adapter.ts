/**
 * HTTP Adapter для экспорта и перезапуска батчей
 *
 * @remarks
 * Реализует IBatchExportPort через REST API.
 * Hexagonal Architecture: Adapter layer.
 */

"use client";

import { getAuthHeaders } from '@/lib/api';
import type {
  IBatchExportPort,
  BatchInnItem
} from '../ports';

/** Ошибка экспорта/перезапуска */
class BatchOperationError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'BatchOperationError';
  }
}

/**
 * HTTP адаптер для операций с батчами
 */
export class HttpBatchExportAdapter implements IBatchExportPort {
  /**
   * Экспортирует результаты батча в XLSX
   *
   * @param batchId - ID батча
   * @returns Promise с Blob файла
   * @throws BatchOperationError при ошибке экспорта
   */
  readonly exportXlsx = async (batchId: string): Promise<Blob> => {
    const response = await fetch(
      `/api/batches/${batchId}/export?format=xlsx`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      let errorMessage = 'Ошибка экспорта';
      try {
        const json = await response.json() as { error?: string };
        if (json.error) errorMessage = json.error;
      } catch {
        // ignore parse error
      }
      throw new BatchOperationError(errorMessage, response.status);
    }

    return response.blob();
  };

  /**
   * Создаёт и запускает новый батч с теми же ИНН
   *
   * @param inns - Массив ИНН для повторного запуска
   * @returns Promise с ID нового батча
   * @throws BatchOperationError при ошибке создания/запуска
   */
  readonly rerunBatch = async (inns: readonly BatchInnItem[]): Promise<string> => {
    // Шаг 1: Создаём новый батч
    const createResponse = await fetch('/api/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ inns })
    });

    if (!createResponse.ok) {
      let errorMessage = 'Ошибка создания батча';
      try {
        const json = await createResponse.json() as { error?: string };
        if (json.error) errorMessage = json.error;
      } catch {
        // ignore
      }
      throw new BatchOperationError(errorMessage, createResponse.status);
    }

    const createJson = await createResponse.json() as { batchId?: string };
    const newBatchId = createJson.batchId;

    if (!newBatchId) {
      throw new BatchOperationError('Не получен ID батча');
    }

    // Шаг 2: Запускаем обработку
    const startResponse = await fetch('/api/organizations/batch-contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ batchId: newBatchId })
    });

    if (!startResponse.ok) {
      let errorMessage = 'Ошибка запуска';
      try {
        const json = await startResponse.json() as { error?: string };
        if (json.error) errorMessage = json.error;
      } catch {
        // ignore
      }
      throw new BatchOperationError(errorMessage, startResponse.status);
    }

    return newBatchId;
  };
}

// Re-export Error для использования в сервисах
export { BatchOperationError };
