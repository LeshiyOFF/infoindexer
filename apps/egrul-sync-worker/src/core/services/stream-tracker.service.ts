import type { ProgressReporter } from '../infrastructure/progress-reporter';
import { PROGRESS_REPORT_INTERVAL, PROGRESS_MAJOR_REPORT_INTERVAL } from '../../config/constants';

/**
 * Сервис для отслеживания прогресса чтения потока
 */
export class StreamTracker {
  constructor(private readonly progress: ProgressReporter) {}

  /**
   * Обрабатывает прогресс для заданной строки
   */
  async handleLine(lineNumber: number): Promise<void> {
    if (lineNumber % PROGRESS_REPORT_INTERVAL === 0) {
      console.log(`[Stream Tracker] Scanned ${lineNumber.toLocaleString()} lines...`);

      if (lineNumber % PROGRESS_MAJOR_REPORT_INTERVAL === 0) {
        await this.progress.report(
          this.progress.createState(
            'running',
            undefined,  // Не указываем процент - неизвестно когда конец
            `Чтение потока: ${lineNumber.toLocaleString()} строк...`,
            lineNumber  // Передаём количество строк для UI
          )
        );
      }
    }
  }
}
