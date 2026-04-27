/**
 * Barrel export для Batch Adapters
 *
 * @remarks
 * Централизованный экспорт адаптеров и factory function.
 */

import { getAuthHeaders } from '@/lib/api';
import { HttpBatchHistoryAdapter } from './http-batch-history.adapter';
import { HttpBatchArchiveAdapter } from './http-batch-archive.adapter';
import { HttpBatchExportAdapter } from './http-batch-export.adapter';

/**
 * Factory для создания всех адаптеров
 *
 * @remarks
 * Dependency Injection: создаёт экземпляры адаптеров.
 * В будущем можно добавить конфигурацию (base URL, etc.)
 */
export function createBatchAdapters() {
  return {
    history: new HttpBatchHistoryAdapter(),
    archive: new HttpBatchArchiveAdapter(),
    export: new HttpBatchExportAdapter()
  } as const;
}

export { HttpBatchHistoryAdapter } from './http-batch-history.adapter';
export { HttpBatchArchiveAdapter } from './http-batch-archive.adapter';
export { HttpBatchExportAdapter, BatchOperationError } from './http-batch-export.adapter';
