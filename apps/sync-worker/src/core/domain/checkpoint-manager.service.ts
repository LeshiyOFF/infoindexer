/**
 * Менеджер чекпоинтов синхронизации
 *
 * @remarks
 * Domain сервис для управления чекпоинтами.
 * Инкапсулирует логику сохранения, загрузки и верификации.
 * Следует SRP: отвечает только за чекпоинты.
 */

import type { ICheckpointStorage, CheckpointData } from '../ports';
import type { IClickHouseStorage } from '../ports';

/**
 * Результат загрузки чекпоинта
 */
export interface ResumeState {
  readonly startFrom: number;
  readonly initialPercentage: number;
  readonly isResuming: boolean;
}

/**
 * Менеджер чекпоинтов синхронизации
 */
export class CheckpointManager {
  private readonly checkpointInterval = 100_000;

  constructor(
    private readonly checkpoint: ICheckpointStorage,
    private readonly storage: IClickHouseStorage
  ) {}

  /**
   * Загружает чекпоинт или возвращает начальное состояние
   *
   * @remarks
   * Проверяет целостность сохранённого чекпоинта.
   * При коррупции очищает и возвращает начальное состояние.
   */
  async loadOrReset(year: number): Promise<ResumeState> {
    const saved = await this.checkpoint.load(year);

    if (!saved) {
      return this.freshState();
    }

    if (saved.checksum && !await this.isChecksumValid(year, saved.checksum)) {
      console.warn('Checkpoint corrupted, resetting');
      await this.checkpoint.clear(year);
      return this.freshState();
    }

    console.log(`Resuming from checkpoint: ${saved.percentage}% (${saved.processedRows} rows)`);

    return {
      startFrom: saved.processedRows,
      initialPercentage: Math.floor(saved.percentage),
      isResuming: true
    };
  }

  /**
   * Сохраняет чекпоинт
   *
   * @remarks
   * Автоматически вычисляет процент и контрольную сумму.
   */
  async save(year: number, processedRows: number, totalRows: number): Promise<void> {
    if (processedRows === 0) {
      return;
    }

    const percentage = Math.floor((processedRows / totalRows) * 100);
    const checksum = processedRows.toString();

    await this.checkpoint.save(year, processedRows, percentage, checksum);
    console.log(`Checkpoint saved: ${processedRows} rows (${percentage}%)`);
  }

  /**
   * Проверяет нужно ли сохранять чекпоинт
   *
   * @remarks
   * Сохраняет каждые N обработанных строк.
   */
  shouldSave(processedRows: number): boolean {
    return processedRows > 0 && processedRows % this.checkpointInterval === 0;
  }

  /**
   * Очищает чекпоинт
   */
  async clear(year: number): Promise<void> {
    await this.checkpoint.clear(year);
  }

  /**
   * Проверяет валидность контрольной суммы
   *
   * @remarks
   * Сравнивает количество строк в ClickHouse с контрольной суммой.
   */
  private async isChecksumValid(year: number, checksum: string): Promise<boolean> {
    try {
      const actualCount = await this.storage.countRows(year);
      const expectedCount = parseInt(checksum, 10);
      const isValid = actualCount === expectedCount;

      if (isValid) {
        console.log(`Checkpoint verified: ${actualCount} rows`);
      } else {
        console.warn(`Checkpoint mismatch: expected ${expectedCount}, actual ${actualCount}`);
      }

      return isValid;
    } catch (error) {
      console.error('Checksum verification error:', error);
      return false;
    }
  }

  /**
   * Возвращает начальное состояние (без чекпоинта)
   */
  private freshState(): ResumeState {
    return {
      startFrom: 0,
      initialPercentage: 0,
      isResuming: false
    };
  }
}
