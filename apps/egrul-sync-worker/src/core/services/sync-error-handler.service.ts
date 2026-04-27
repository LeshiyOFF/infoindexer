import type { ProgressReporter } from '../infrastructure/progress-reporter';

/**
 * Сервис обработки ошибок синхронизации
 */
export class SyncErrorHandler {
  constructor(private readonly progress: ProgressReporter) {}

  /**
   * Обрабатывает ошибку синхронизации
   */
  async handleError(error: unknown): Promise<void> {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('CRITICAL EGRUL SYNC ERROR:', error);

    await this.progress.report({
      status: 'error',
      error: msg,
      message: `Ошибка: ${msg}`,
      updated_at: new Date().toISOString()
    });
  }
}
