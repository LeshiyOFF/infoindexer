/**
 * Barrel export для Batch Services
 *
 * @remarks
 * Централизованный экспорт сервисов и factory function.
 */

import { BatchHistoryService } from './batch-history.service';
import { BatchArchiveService } from './batch-archive.service';
import { createBatchAdapters } from '../adapters';

/**
 * Factory для создания сервисов с dependency injection
 *
 * @remarks
 * Создаёт адаптеры и передаёт их в сервисы.
 * Следует Dependency Inversion Principle.
 */
export function createBatchServices() {
  const adapters = createBatchAdapters();

  return {
    history: new BatchHistoryService(adapters.history),
    archive: new BatchArchiveService(adapters.archive, adapters.export)
  } as const;
}

export type { BatchHistoryResult } from './batch-history.service';
export type { BatchArchiveError } from './batch-archive.service';
export { BatchHistoryService } from './batch-history.service';
export { BatchArchiveService } from './batch-archive.service';
