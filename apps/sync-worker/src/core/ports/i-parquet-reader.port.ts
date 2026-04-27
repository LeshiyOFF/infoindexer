/**
 * Port для чтения Parquet файлов
 *
 * @remarks
 * Абстракция над Parquet источником данных.
 */

import type { ColumnDescription, ParquetRow } from '../types';

/**
 * Результат DESCRIBE query
 */
export interface DescribeResult {
  readonly column_name: string;
  readonly column_type: string;
}

/**
 * Port для чтения Parquet данных
 */
export interface IParquetReader {
  /**
   * Получает описание колонок из Parquet файла
   */
  describe(url: string): Promise<readonly DescribeResult[]>;

  /**
   * Стримит строки из Parquet файла
   */
  streamRows(url: string): AsyncIterable<ParquetRow>;

  /**
   * Подсчитывает количество строк в Parquet файле
   */
  countRows(url: string): Promise<number>;

  /**
   * Закрывает соединение
   */
  close(): Promise<void>;
}
