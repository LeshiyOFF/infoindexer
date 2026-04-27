/**
 * Sync Stage Reporter
 *
 * Выделенные методы отчета о прогрессе для соблюдения size limits.
 */

import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { StageResult, StageMetadata } from './stage-context';
import { createSyncStatus, calculateStagePercentage } from 'shared';
import { isStageSuccess } from './stage-context';

/**
 * Отвечает за отчет о прогрессе stage
 */
export class SyncStageReporter {
  private lastReportTime = 0;
  private readonly REPORT_THROTTLE = 500;

  constructor(private readonly reporter: ProgressReporter) {}

  /**
   * Отчёт о начале stage
   */
  async reportStart(metadata: StageMetadata): Promise<void> {
    const state = createSyncStatus(
      'running',
      metadata.stage,
      `Начало: ${metadata.name}`,
      undefined  // percentage - indeterminate режим
    );
    await this.reporter.report(state);
  }

  /**
   * Отчёт о завершении stage
   */
  async reportComplete(metadata: StageMetadata, result: StageResult): Promise<void> {
    const message = isStageSuccess(result)
      ? `${metadata.name} завершено: ${result.processed} записей`
      : `${metadata.name}: ${result.error}`;

    const state = createSyncStatus(
      'running',
      metadata.stage,
      message,
      undefined  // percentage - indeterminate режим
    );
    await this.reporter.report(state);
  }

  /**
   * Отчёт об ошибке
   */
  async reportError(metadata: StageMetadata, error: string, code: string): Promise<void> {
    const state = createSyncStatus(
      'error',
      metadata.stage,
      `Ошибка: ${error}`,
      undefined,  // percentage
      undefined,  // startedAt
      code  // error
    );
    await this.reporter.report(state);
  }

  /**
   * Отчёт о прогрессе с throttling
   */
  throttledReport(metadata: StageMetadata, progress: number, message: string): void {
    const now = Date.now();
    if (now - this.lastReportTime < this.REPORT_THROTTLE) {
      return;
    }
    this.lastReportTime = now;

    const state = createSyncStatus(
      'running',
      metadata.stage,
      message,
      undefined  // percentage - indeterminate режим
    );
    void this.reporter.report(state);
  }
}
