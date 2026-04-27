/**
 * Маппер для валидации и преобразования параметров сортировки
 */
export declare class SortMapper {
    private static readonly ALLOWED_FIELDS;
    private static readonly COLUMN_MAP;
    /**
     * Валидирует поле сортировки
     */
    static validateSortField(sortBy: string): string;
    /**
     * Валидирует направление сортировки
     */
    static validateSortOrder(sortOrder: string): 'ASC' | 'DESC';
    /**
     * Маппит поле сортировки на колонку в summary таблице
     */
    static mapToSummaryColumn(sortBy: string): string;
}
