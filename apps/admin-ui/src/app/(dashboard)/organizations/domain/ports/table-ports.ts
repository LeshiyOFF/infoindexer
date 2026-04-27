/**
 * HEXAGONAL ARCHITECTURE: DOMAIN LAYER — PORTS
 *
 * @remarks
 * Ports — это АБСТРАКЦИИ в центре гексагона.
 * НЕ зависят от Redis, HTTP, React — только от бизнес-концептов.
 *
 * Hexagonal Pattern:
 * - Driving Adapters (React, HTTP) → зависят ОТ этих Port-ов
 * - Driven Adapters (Redis, CH) — реализуют эти Port-ы
 *
 * SOLID:
 * - ISP: Каждый Port — минимальный интерфейс
 * - DIP: Direction of dependency → INWARD (к Domain)
 */

import type { CompanyMeta } from 'shared/client';

// ============================================================
// PORT: Primary (Driving) Side — что может делать пользователь
// ============================================================

/**
 * Primary Port для сортировки
 *
 * @remarks
 * Driving Adapter (UI) → вызывает этот Port
 * Определяет "КАК" можно сортировать, но не "ЧЕМ" сортировать
 */
export interface ISortPort {
  readonly sortBy: string;
  readonly sortOrder: 'ASC' | 'DESC';
  readonly handleSort: (field: string) => void;
}

/**
 * Primary Port для пагинации
 *
 * @remarks
 * Driving Adapter (UI) → вызывает этот Port
 * Определяет контракт навигации по страницам
 */
export interface IPaginationPort {
  readonly page: number;
  readonly totalPages: number;
  readonly canGoNext: boolean;
  readonly canGoPrev: boolean;
  readonly goToPage: (updater: (p: number) => number) => void;
}

/**
 * Primary Port для выбора в батч
 *
 * @remarks
 * Driving Adapter (UI) → вызывает этот Port
 * Определяет контракт работы с батчами
 */
export interface IBatchSelectionPort {
  readonly batchInnSet: ReadonlySet<string>;
  readonly isInBatch: (inn: string) => boolean;
  readonly toggleBatch: (inn: string, name: string, e: React.MouseEvent) => void;
  readonly toggleBatchPage: (items: readonly OrganizationRef[], e?: React.SyntheticEvent) => void;
}

// ============================================================
// VALUE OBJECTS — Domain Concepts
// ============================================================

export interface OrganizationRef {
  readonly inn: string;
  readonly name: string;
}

export interface SortIconState {
  readonly isActive: boolean;
  readonly direction: 'ASC' | 'DESC' | null;
}
