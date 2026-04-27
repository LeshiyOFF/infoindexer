/**
 * HEXAGONAL ARCHITECTURE: DOMAIN LAYER — SERVICE
 *
 * @remarks
 * Domain Service — бизнес-логика в центре гексагона.
 *
 * SOLID:
 * - SRP: Только бизнес-логика списка организаций
 * - DIP: Зависит от Port-ов (абстракций), не от реализаций
 */

export interface OrganizationListViewModel {
  readonly pagination: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly canGoNext: boolean;
    readonly canGoPrev: boolean;
    readonly totalItems: number;
  };
}

/**
 * Domain Service для списка организаций
 *
 * @remarks
 * Чистые функции для трансформации данных.
 * НЕ зависит от UI (React) или инфраструктуры (Redis).
 */
export class OrganizationListService {
  /**
   * Создать ViewModel для пагинации
   *
   * @remarks
   * Pure function — используется в UI
   */
  readonly createPaginationViewModel = (
    page: number,
    limit: number,
    total: number
  ): OrganizationListViewModel['pagination'] => {
    const totalPages = Math.ceil(total / limit);

    return {
      currentPage: page,
      totalPages,
      canGoNext: page < totalPages,
      canGoPrev: page > 1,
      totalItems: total
    };
  };

  /**
   * Проверить, есть ли следующая страница
   */
  readonly hasNextPage = (page: number, totalPages: number): boolean => {
    return page < totalPages;
  };

  /**
   * Проверить, есть ли предыдущая страница
   */
  readonly hasPrevPage = (page: number): boolean => {
    return page > 1;
  };

  /**
   * Получить метку для иконки сортировки
   */
  readonly getSortIconLabel = (isActive: boolean, direction: 'ASC' | 'DESC' | null): string => {
    if (!isActive) return '⇅';
    return direction === 'ASC' ? '↑' : '↓';
  };
}
