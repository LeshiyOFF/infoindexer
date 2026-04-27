/**
 * Adapter: ProgressReporter → IProgressReporterPort
 *
 * @remarks
 * Адаптирует класс ProgressReporter к порту для использования в зависимостях.
 * Следует Adapter pattern: преобразует один интерфейс в другой.
 */

import type { IProgressReporterPort } from '../../ports/i-progress-reporter-readable.port';
import type { ProgressReporter } from '../progress-reporter';

export class ProgressReporterAdapter implements IProgressReporterPort {
  constructor(private readonly reporter: ProgressReporter) {}

  async report(state: {
    status: string;
    percentage?: number;
    message?: string;
    error?: string;
    updated_at?: string;
    completed_at?: string;
    rows_processed?: number;
  }): Promise<void> {
    await this.reporter.report(state);
  }

  createState(
    status: string,
    percentage?: number,
    message?: string,
    rowsProcessed?: number
  ): {
    status: string;
    percentage?: number;
    message?: string;
    rows_processed?: number;
    updated_at: string;
  } {
    const state = this.reporter.createState(status, percentage, message, rowsProcessed);
    return {
      ...state,
      updated_at: state.updated_at ?? new Date().toISOString()
    };
  }
}
