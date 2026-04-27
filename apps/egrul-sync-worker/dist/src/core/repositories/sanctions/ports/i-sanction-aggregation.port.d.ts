/**
 * Port для агрегированных запросов по санкциям
 *
 * @remarks
 * Доменный интерфейс для получения агрегированной статистики
 * по странам и программам санкций.
 */
export interface ISanctionAggregation {
    /**
     * Получает агрегацию по странам
     *
     * @returns Record где ключ — страна, значение — количество санкций
     */
    getByCountry(): Promise<Record<string, number>>;
    /**
     * Получает агрегацию по программам
     *
     * @returns Record где ключ — программа, значение — количество санкций
     */
    getByProgram(): Promise<Record<string, number>>;
}
