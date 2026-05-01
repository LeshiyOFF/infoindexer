/**
 * HEXAGONAL ARCHITECTURE: INFRASTRUCTURE LAYER — ADAPTER
 *
 * @remarks
 * Redis Adapter для Batch Repository.
 * Реализует Port для Redis.
 *
 * SOLID:
 * - SRP: Только работа с Redis
 * - DIP: Реализует интерфейс Port
 * - OCP: Легко заменить на другой адаптер
 */

import { redisClient } from 'shared/redis';
import type {
  IBatchRepositoryPort,
  BatchMeta,
  BatchInnItem,
  CreateBatchParams
} from '../../domain/ports/batch-ports';

const BATCH_TTL_SEC = 7 * 24 * 60 * 60; // 7 дней

/**
 * Redis Adapter для батчей
 *
 * @remarks
 * Реализует IBatchRepositoryPort.
 * Infrastructure details: знает про Redis, pipeline, TTL.
 */
export class RedisBatchAdapter implements IBatchRepositoryPort {
  /** Получить список batch ID с пагинацией */
  readonly getBatchList = async (offset: number, limit: number): Promise<readonly string[]> => {
    return await redisClient.zrevrange('batch:list', offset, offset + limit - 1);
  };

  /** Получить метаданные батча */
  readonly getBatchMeta = async (batchId: string): Promise<BatchMeta | null> => {
    const raw = await redisClient.hgetall(`batch:${batchId}`);
    if (!raw || !raw.status) return null;

    return {
      status: raw.status,
      createdAt: parseInt(raw.createdAt || '0', 10),
      inns: raw.inns ? JSON.parse(raw.inns) as BatchInnItem[] : [],
      completedCount: parseInt(raw.completedCount || '0', 10)
    };
  };

  /** Получить статусы ИНН в батче */
  readonly getBatchInnsStatus = async (
    batchId: string,
    inns: readonly string[]
  ): Promise<readonly (string | null)[]> => {
    if (inns.length === 0) return [];

    const pipeline = redisClient.pipeline();
    for (const inn of inns) {
      pipeline.hget(`batch:${batchId}:inn_status`, inn);
    }
    const results = await pipeline.exec();

    return (results ?? []).map(r => {
      if (r && r[0] === null && r[1]) {
        return r[1] as string;
      }
      return null;
    });
  };

  /** Получить статусы контактов из fallback */
  readonly getContactsStatus = async (inns: readonly string[]): Promise<ReadonlyMap<string, string>> => {
    if (inns.length === 0) return new Map();

    const pipeline = redisClient.pipeline();
    for (const inn of inns) {
      pipeline.hget(`contacts:status:${inn}`, 'status');
    }
    const results = await pipeline.exec();

    const map = new Map<string, string>();
    if (results) {
      inns.forEach((inn, i) => {
        const r = results[i];
        if (r && r[0] === null && r[1]) {
          map.set(inn, r[1] as string);
        }
      });
    }
    return map;
  };

  /** Обновить статус батча */
  readonly updateBatchStatus = async (batchId: string, status: string): Promise<void> => {
    await redisClient.hset(`batch:${batchId}`, 'status', status);
  };

  /** Создать новый батч */
  readonly createBatch = async (params: CreateBatchParams): Promise<string> => {
    const { inns, batchId, createdAt } = params;

    await redisClient
      .multi()
      .hset(`batch:${batchId}`, {
        status: 'pending',
        createdAt: createdAt.toString(),
        inns: JSON.stringify(inns),
        totalCount: inns.length.toString(),
        completedCount: '0'
      })
      .zadd('batch:list', createdAt, batchId)
      .expire(`batch:${batchId}`, BATCH_TTL_SEC)
      .exec();

    return batchId;
  };

  /** Получить общее количество батчей */
  readonly getListCount = async (): Promise<number> => {
    return await redisClient.zcard('batch:list');
  };
}
