/**
 * Результат проверки готовности summary таблицы
 */
export interface SummaryCheckResult {
  readonly ready: boolean;
  readonly hasData: boolean;
  readonly rowCount: number;
  readonly mvExists: boolean;
  readonly viewExists: boolean;
  readonly hasOkvedColumn: boolean;
}

/**
 * Port для проверки готовности summary таблицы
 *
 * @remarks
 * Интерфейс (Port) в терминологии Hexagonal Architecture.
 */
export interface ISummaryChecker {
  /**
   * Проверяет готовность таблицы financial_reports_summary
   *
   * @returns Результат проверки с флагами готовности
   */
  check(): Promise<SummaryCheckResult>;
}
