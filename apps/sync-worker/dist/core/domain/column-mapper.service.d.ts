/**
 * Сервис для маппинга колонок и данных
 *
 * @remarks
 * Объединяет NameMapperUtil и ColumnTypeUtil.
 * Отвечает за преобразование данных из Parquet в ClickHouse формат.
 */
import type { ColumnDefinition, ParquetRow, FinancialReportRow } from '../types';
/**
 * Сервис для маппинга колонок
 */
export declare class ColumnMapper {
    private readonly nameMapper;
    private readonly typeUtil;
    constructor(csvPath: string);
    /**
     * Преобразует результаты DESCRIBE в определения колонок для ClickHouse
     */
    mapDescribeResults(results: readonly {
        column_name: string;
        column_type: string;
    }[]): ColumnDefinition[];
    /**
     * Преобразует строку из Parquet в формат ClickHouse
     *
     * @remarks
     * Фильтрует неизвестные поля которые не входят в схему таблицы.
     * Это предотвращает ошибки парсинга JSON при вставке.
     */
    mapRow(row: ParquetRow): FinancialReportRow;
    /**
     * Преобразует значение в формат ClickHouse
     *
     * @remarks
     * Важно: ClickHouse JSONEachRow ожидает числа без кавычек для числовых полей.
     * @clickhouse/client НЕ добавляет кавычки для строк в числовых полях, что вызывает
     * ошибку парсинга. Поэтому строковые значения для числовых полей возвращаются как null.
     */
    private convertValue;
    /**
     * Форматирует дату в строку
     */
    private formatDate;
}
