/**
 * HEXAGONAL ARCHITECTURE: DOMAIN LAYER — SERVICE
 *
 * @remarks
 * Domain Service для списка батчей.
 *
 * SOLID:
 * - SRP: Логика работы со списком батчей
 * - DIP: Зависит от Port (IBatchRepositoryPort)
 */

import type {
  IBatchRepositoryPort,
  BatchListItem,
  BatchInnItem
} from '../ports/batch-ports';

export interface BatchListResult {
  readonly items: readonly BatchListItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

/**
 * Domain Service для списка батчей
 *
 * @remarks
 * НЕ зависит от:
 * - Redis (Infrastructure)
 * - HTTP (Transport)
 *
 * Зависит ТОЛЬКО от:
 * - IBatchRepositoryPort (абстракция)
 */
export class BatchListService {
  constructor(private readonly repository: IBatchRepositoryPort) {}

  /**
   * Получить список батчей с актуальным статусом
   *
   * @remarks
   * Бизнес-логика: обновляет completedCount для running батчей.
   */
  readonly getBatchList = async (
    page: number,
    limit: number
  ): Promise<BatchListResult> => {
    const offset = (page - 1) * limit;

    // 1. Получаем batch IDs
    const batchIds = await this.repository.getBatchList(offset, limit);

    // 2. Загружаем элементы
    const items = await this.fetchBatchItems(batchIds);

    // 3. Обновляем completedCount из статусов
    const itemsWithStatus = await this.updateCompletedCount(items);

    // 4. Завершаем батчи, которые завершились
    await this.finalizeCompletedBatches(itemsWithStatus);

    const total = await this.repository.getListCount();

    return {
      items: itemsWithStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  };

  /** Загрузить базовые элементы батчей */
  private readonly fetchBatchItems = async (
    batchIds: readonly string[]
  ): Promise<readonly BatchListItem[]> => {
    const items: BatchListItem[] = [];
    const innsToFetch: Array<{
      readonly batchId: string;
      readonly batchIdx: number;
      readonly inns: readonly BatchInnItem[];
    }> = [];

    for (let i = 0; i < batchIds.length; i++) {
      const batchId = batchIds[i] as string;
      const meta = await this.repository.getBatchMeta(batchId);
      if (!meta) continue;

      const batchIdx = items.length;
      if ((meta.status === 'running' || meta.status === 'completed') && meta.inns.length > 0) {
        innsToFetch.push({ batchId, batchIdx, inns: meta.inns });
      }

      items.push({
        batchId,
        createdAt: meta.createdAt,
        status: meta.status,
        totalCount: meta.inns.length,
        completedCount: meta.completedCount,
        innsCount: meta.inns.length
      });
    }

    return items;
  };

  /** Обновить completedCount из статусов */
  private readonly updateCompletedCount = async (
    items: readonly BatchListItem[]
  ): Promise<readonly BatchListItem[]> => {
    // Создаём mutable копию для обновлений
    const mutableItems = [...items] as BatchListItem[];

    // Находим индексы элементов, которые нужно обновить
    const toUpdate: Array<{ idx: number; batchId: string; inns: readonly BatchInnItem[] }> = [];

    for (let i = 0; i < mutableItems.length; i++) {
      const item = mutableItems[i];
      if (item.status === 'running' || item.status === 'completed') {
        const meta = await this.repository.getBatchMeta(item.batchId);
        if (meta && meta.inns.length > 0) {
          toUpdate.push({ idx: i, batchId: item.batchId, inns: meta.inns });
        }
      }
    }

    if (toUpdate.length === 0) return mutableItems;

    // Получаем статусы для всех ИНН
    for (const { idx, batchId, inns } of toUpdate) {
      const innList = inns.map(x => x.inn);
      const statuses = await this.repository.getBatchInnsStatus(batchId, innList);

      // Получаем fallback статусы
      const nullIndices = innList
        .map((_, i) => statuses[i] === null ? i : -1)
        .filter(i => i >= 0);

      if (nullIndices.length > 0) {
        const fallbackInns = nullIndices.map(i => innList[i]);
        const uniqueFallbackInns = Array.from(new Set(fallbackInns));
        const fallbackMap = await this.repository.getContactsStatus(uniqueFallbackInns);

        for (const nullIdx of nullIndices) {
          const inn = innList[nullIdx];
          const fallbackStatus = fallbackMap.get(inn);
          if (fallbackStatus) {
            (statuses as (string | null)[])[nullIdx] = fallbackStatus;
          }
        }
      }

      // Считаем завершенные
      const completed = statuses.filter(s => s === 'completed' || s === 'error').length;
      mutableItems[idx] = { ...mutableItems[idx], completedCount: completed };
    }

    return mutableItems;
  };

  /** Завершить батчи, которые завершились */
  private readonly finalizeCompletedBatches = async (
    items: readonly BatchListItem[]
  ): Promise<void> => {
    const toComplete = items.filter(
      item => item.status === 'running' && item.completedCount === item.totalCount
    );

    for (const item of toComplete) {
      await this.repository.updateBatchStatus(item.batchId, 'completed');
    }
  };
}
