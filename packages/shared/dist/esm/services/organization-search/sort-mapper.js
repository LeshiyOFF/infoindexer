/**
 * Маппер для валидации и преобразования параметров сортировки
 */
export class SortMapper {
    static ALLOWED_FIELDS = [
        'inn',
        'ogrn',
        'latest_year',
        'records_count',
        'name',
        'revenue',
        'age',
        'net_profit',
        'director'
    ];
    static COLUMN_MAP = {
        revenue: 'revenue',
        name: 'name',
        director: 'director',
        inn: 'inn'
    };
    /**
     * Валидирует поле сортировки
     */
    static validateSortField(sortBy) {
        return this.ALLOWED_FIELDS.includes(sortBy)
            ? sortBy
            : 'records_count';
    }
    /**
     * Валидирует направление сортировки
     */
    static validateSortOrder(sortOrder) {
        return sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }
    /**
     * Маппит поле сортировки на колонку в summary таблице
     */
    static mapToSummaryColumn(sortBy) {
        return this.COLUMN_MAP[sortBy] || sortBy;
    }
}
