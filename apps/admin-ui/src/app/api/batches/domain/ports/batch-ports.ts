/**
 * HEXAGONAL ARCHITECTURE: DOMAIN LAYER — PORTS
 *
 * @remarks
 * Ports для Batch API.
 * SOLID: ISP — разные интерфейсы для разных операций.
 */

// === Value Objects ===
export interface BatchInnItem {
  readonly inn: string;
  readonly name: string;
}

export interface BatchMeta {
  readonly status: string;
  readonly createdAt: number;
  readonly inns: readonly BatchInnItem[];
  readonly completedCount: number;
}

export interface BatchListItem {
  readonly batchId: string;
  readonly createdAt: number;
  readonly status: string;
  readonly totalCount: number;
  readonly completedCount: number;
  readonly innsCount: number;
}

// === PORT 1: Batch Repository (Single Responsibility) ===
export interface IBatchRepositoryPort {
  readonly getBatchList: (offset: number, limit: number) => Promise<readonly string[]>;
  readonly getBatchMeta: (batchId: string) => Promise<BatchMeta | null>;
  readonly getBatchInnsStatus: (
    batchId: string,
    inns: readonly string[]
  ) => Promise<readonly (string | null)[]>;
  readonly getContactsStatus: (inns: readonly string[]) => Promise<ReadonlyMap<string, string>>;
  readonly updateBatchStatus: (batchId: string, status: string) => Promise<void>;
  readonly createBatch: (params: CreateBatchParams) => Promise<string>;
  readonly getListCount: () => Promise<number>;
}

export interface CreateBatchParams {
  readonly inns: readonly BatchInnItem[];
  readonly batchId: string;
  readonly createdAt: number;
}

// === PORT 2: Authentication (Single Responsibility) ===
export interface IAuthenticationPort {
  readonly isAuthenticated: (request: Request) => boolean;
  readonly unauthorizedResponse: UnauthorizedResponse;
}

export interface UnauthorizedResponse {
  readonly json: Record<string, unknown>;
  readonly status: number;
}
