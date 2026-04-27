/**
 * SanctionList Value Object
 *
 * SanctionList — Value Object для списка санкций
 * Используется для операций над множеством санкций
 */

import { Result } from '../../result';
import { DomainError, InvalidSanctionProgramError } from '../errors';
import { Sanction } from './sanction';
import type { SanctionDTO } from './sanction-types';

/**
 * SanctionList — Value Object для списка санкций
 *
 * Используется для операций над множеством санкций
 */
export class SanctionList {
  private constructor(private readonly sanctions: readonly Sanction[]) {}

  /**
   * Создаёт список из массива Sanction
   * Проверяет уникальность ID
   */
  static create(sanctions: readonly Sanction[]): Result<SanctionList, DomainError> {
    const ids = new Set<string>();
    const duplicates: string[] = [];

    for (const sanction of sanctions) {
      if (ids.has(sanction.id)) {
        duplicates.push(sanction.id);
      }
      ids.add(sanction.id);
    }

    if (duplicates.length > 0) {
      return Result.error(
        new InvalidSanctionProgramError('Duplicate sanction IDs', { duplicates })
      );
    }

    return Result.ok(new SanctionList(sanctions));
  }

  /**
   * Создаёт список без валидации (internal use)
   */
  static createUnsafe(sanctions: readonly Sanction[]): SanctionList {
    return new SanctionList(sanctions);
  }

  /**
   * Фильтрует активные санкции
   */
  get active(): readonly Sanction[] {
    return this.sanctions.filter(s => s.isActive);
  }

  /**
   * Фильтрует снятые санкции
   */
  get lifted(): readonly Sanction[] {
    return this.sanctions.filter(s => !s.isActive);
  }

  /**
   * Список всех санкций
   */
  get all(): readonly Sanction[] {
    return this.sanctions;
  }

  /**
   * Количество санкций
   */
  get size(): number {
    return this.sanctions.length;
  }

  /**
   * Преобразует все санкции в DTO
   */
  toDTO(): readonly SanctionDTO[] {
    return this.sanctions.map(s => s.toDTO());
  }

  /**
   * Находит санкцию по ID
   */
  findById(id: string): Sanction | null {
    return this.sanctions.find(s => s.id === id) ?? null;
  }

  /**
   * Фильтрует санкции по ИНН
   */
  findByInn(inn: string): readonly Sanction[] {
    return this.sanctions.filter(s => s.inn === inn);
  }

  /**
   * Группирует санкции по стране
   */
  groupByCountry(): Readonly<Record<string, readonly Sanction[]>> {
    const result: Record<string, Sanction[]> = {};

    for (const sanction of this.sanctions) {
      const country = sanction.program.country.value;
      if (!result[country]) {
        result[country] = [];
      }
      result[country].push(sanction);
    }

    return result;
  }
}
