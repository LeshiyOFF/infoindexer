/**
 * Сервис для оркестрации денормализации данных EGRUL
 *
 * @remarks
 * Следует SRP: отвечает за координацию процесса денормализации.
 * Делегирует фактические операции Repository.
 *
 * Idempotent: можно вызывать многократно без побочных эффектов.
 */

import type { IDenormalizedRelationsRepository } from '../repositories/ports';

/**
 * Сервис для оркестрации денормализации данных EGRUL
 *
 * @remarks
 * Выполняет denormalization отношений компании-директор-владелец
 * для оптимизации JOIN запросов и устранения Memory limit exceeded.
 */
export class DenormalizationService {
  constructor(
    private readonly repository: IDenormalizedRelationsRepository
  ) {}

  /**
   * Выполняет полную денормализацию данных
   *
   * @remarks
   * 1. Очищает предыдущие данные (идемпотентность)
   * 2. Подготавливает директоров
   * 3. Подготавливает владельцев
   *
   * Идемпотентен: безопасен для многократного вызова.
   */
  async run(): Promise<void> {
    console.log('Starting EGRUL relations denormalization...');

    await this.repository.clear();
    await this.repository.prepareDirectors();
    await this.repository.prepareFounders();

    console.log('EGRUL relations denormalization completed!');
  }
}
