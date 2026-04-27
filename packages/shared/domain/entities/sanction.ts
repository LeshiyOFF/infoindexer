/**
 * Sanction Aggregate Root
 *
 * Aggregate root для домена Sanctions.
 * Координирует Value Objects и обеспечивает целостность бизнес-логики.
 *
 * @remarks
 * Sanction является корнем aggregate. Все изменения проходят через него.
 */

import { Result } from '../../result';
import {
  InvalidSanctionProgramError,
  DomainError
} from '../errors';
import {
  Authority,
  CountryCode,
  SanctionProgram,
  SanctionPeriod,
  SecureUrl
} from '../value-objects';
import { SanctionData, SanctionDTO } from './sanction-types';

/**
 * Sanction Aggregate Root
 *
 * Представляет санкцию наложенную на компанию.
 * Является корнем агрегата, координирует Value Objects.
 */
export class Sanction {
  private constructor(
    public readonly id: string,
    public readonly inn: string,
    public readonly program: SanctionProgram,
    public readonly period: SanctionPeriod,
    public readonly sourceUrl: SecureUrl,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Factory method с полной валидацией
   *
   * @returns Result<Sanction, DomainError> — успешное создание или ошибка валидации
   *
   * @example
   * ```ts
   * const result = Sanction.create({
   *   id: '123',
   *   inn: '7727771492',
   *   program: 'EU Sanctions',
   *   ...
   * });
   *
   * result.match({
   *   ok: (sanction) => console.log('Created:', sanction.toDTO()),
   *   err: (error) => console.error('Invalid:', error.toLog())
   * });
   * ```
   */
  static create(data: SanctionData): Result<Sanction, DomainError> {
    try {
      return Result.ok(Sanction.createUnsafe(data));
    } catch (error) {
      return Result.error(error as DomainError);
    }
  }

  /**
   * Создаёт Sanction без Result wrapper
   * Используется internally когда ошибки уже обработаны
   *
   * @throws DomainError при невалидных данных
   * @internal
   */
  static createUnsafe(data: SanctionData): Sanction {
    // Валидация и создание Value Objects
    const authority = Authority.create(data.authority, data.country);
    const country = CountryCode.create(data.country);
    const program = SanctionProgram.create(
      data.program,
      data.programId,
      authority,
      country
    );
    const period = SanctionPeriod.create(
      new Date(data.startDate),
      data.endDate ? new Date(data.endDate) : null
    );
    const url = SecureUrl.create(data.sourceUrl);

    // Валидация id и inn
    if (!data.id || data.id.trim().length === 0) {
      throw new InvalidSanctionProgramError('Sanction ID cannot be empty', {
        id: data.id
      });
    }

    const inn = data.inn.trim();
    if (inn.length === 0) {
      throw new InvalidSanctionProgramError('INN cannot be empty', {
        inn: data.inn
      });
    }

    const now = new Date();
    const createdAt = data.createdAt ?? now;
    const updatedAt = data.updatedAt ?? now;

    return new Sanction(
      data.id.trim(),
      inn,
      program,
      period,
      url,
      createdAt,
      updatedAt
    );
  }

  /**
   * Проверяет активна ли санкция
   */
  get isActive(): boolean {
    return this.period.isActive;
  }

  /**
   * Преобразует в DTO для API response
   */
  toDTO(): SanctionDTO {
    return {
      id: this.id,
      inn: this.inn,
      program: this.program.name,
      programId: this.program.id,
      authority: this.program.authority.name,
      country: this.program.country.value,
      startDate: this.period.startDate.toISOString(),
      endDate: this.period.endDate?.toISOString() ?? null,
      sourceUrl: this.sourceUrl.value,
      isActive: this.period.isActive
    };
  }

  /**
   * Aggregate identity: две санкции равны если равны их ID
   */
  equals(other: Sanction): boolean {
    return this.id === other.id;
  }

  /**
   * Создаёт новую санкцию с обновлённым статусом
   * (например, при снятии санкции)
   */
  withEndDate(endDate: Date): Result<Sanction, DomainError> {
    try {
      const newPeriod = SanctionPeriod.create(this.period.startDate, endDate);

      return Result.ok(
        new Sanction(
          this.id,
          this.inn,
          this.program,
          newPeriod,
          this.sourceUrl,
          this.createdAt,
          new Date()
        )
      );
    } catch (error) {
      return Result.error(error as DomainError);
    }
  }
}
