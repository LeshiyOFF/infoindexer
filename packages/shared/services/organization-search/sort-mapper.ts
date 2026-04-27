/**
 * Маппер для валидации и преобразования параметров сортировки
 */
export class SortMapper {
  private static readonly ALLOWED_FIELDS = [
    'inn',
    'ogrn',
    'latest_year',
    'records_count',
    'name',
    'revenue',
    'age',
    'net_profit',
    'director'
  ] as const;

  private static readonly COLUMN_MAP: Record<string, string> = {
    revenue: 'revenue',
    name: 'name',
    director: 'director',
    inn: 'inn'
  };

  /**
   * Валидирует поле сортировки
   */
  static validateSortField(sortBy: string): string {
    return this.ALLOWED_FIELDS.includes(sortBy as never)
      ? sortBy
      : 'records_count';
  }

  /**
   * Валидирует направление сортировки
   */
  static validateSortOrder(sortOrder: string): 'ASC' | 'DESC' {
    return sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  }

  /**
   * Маппит поле сортировки на колонку в summary таблице
   */
  static mapToSummaryColumn(sortBy: string): string {
    return this.COLUMN_MAP[sortBy] || sortBy;
  }
}
