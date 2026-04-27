/**
 * Barrel export для Batch Ports
 *
 * @remarks
 * Централизованный экспорт всех Port interfaces для адаптеров и сервисов.
 */

export type {
  BatchStatus,
  BatchHistoryItem,
  BatchHistoryResponse,
  IBatchHistoryPort
} from './i-batch-history.port';

export type {
  BatchInnItem,
  ContactData,
  ContactEmail,
  ContactPhone,
  BatchResult,
  BatchResults,
  BatchArchiveMeta,
  BatchArchiveData,
  IBatchArchivePort
} from './i-batch-archive.port';

export type {
  BatchRerunResult,
  IBatchExportPort
} from './i-batch-export.port';
