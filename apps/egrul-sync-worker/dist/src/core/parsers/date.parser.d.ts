/**
 * Парсер дат для EGRUL данных
 * Обеспечивает безопасный парсинг с fallback значениями
 */
/**
 * Парсит дату из строки. Возвращает сегодняшнюю дату если парсинг неудачен.
 *
 * @param dateStr - Строка с датой в формате ISO или похожем
 * @returns Дата в формате YYYY-MM-DD
 */
export declare function parseDate(dateStr: string | undefined): string;
/**
 * Парсит nullable дату. Возвращает null если дата пустая или неверная.
 *
 * @param dateStr - Строка с датой или undefined
 * @returns Дата в формате YYYY-MM-DD или null
 */
export declare function parseNullableDate(dateStr: string | undefined): string | null;
