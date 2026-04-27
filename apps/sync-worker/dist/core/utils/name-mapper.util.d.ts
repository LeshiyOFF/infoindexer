/**
 * Утилита для маппинга имён колонок
 *
 * @remarks
 * Парсит CSV файл с правилами переименования колонок.
 */
/**
 * Карта для маппинга имён колонок
 */
export type ColumnNameMap = Readonly<Record<string, string>>;
/**
 * Утилита для маппинга имён колонок
 */
export declare class NameMapperUtil {
    private readonly map;
    constructor(csvPath: string);
    /**
     * Получает маппинг имён колонок
     */
    getMap(): ColumnNameMap;
    /**
     * Преобразует имя колонки по карте
     */
    mapName(original: string): string;
    /**
     * Парсит CSV файл с правилами маппинга
     */
    private parseCsv;
}
