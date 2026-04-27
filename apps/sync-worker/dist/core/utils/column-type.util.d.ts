/**
 * Утилита для конвертации типов колонок
 *
 * @remarks
 * Конвертирует DuckDB типы в ClickHouse типы.
 */
import type { ColumnDescription } from '../types';
/**
 * Утилита для конвертации типов колонок
 */
export declare class ColumnTypeUtil {
    /**
     * Получает ClickHouse тип из DuckDB типа
     */
    getClickHouseType(duckdbType: string, columnName: string): string;
    /**
     * Создаёт описание колонки
     */
    createColumnDescription(name: string, duckdbType: string): ColumnDescription;
    /**
     * Получает множество известных колонок financial_reports
     *
     * @remarks
     * Используется для фильтрации неизвестных полей из Parquet.
     * Поля которых нет в схеме (financial, outlier и т.д.) игнорируются.
     */
    getKnownColumns(): Set<string>;
    /**
     * Преобразует DuckDB тип в базовый ClickHouse тип
     */
    private mapDuckDbTypeToClickHouse;
}
