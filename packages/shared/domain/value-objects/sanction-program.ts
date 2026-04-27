/**
 * Sanction Program Value Object
 *
 * Sanction Program — программа санкций
 *
 * @example
 * ```ts
 * const program = SanctionProgram.create(
 *   'EU Sanctions related to actions undermining Ukraine',
 *   'EU-RUSSIA-2022',
 *   authority,
 *   countryCode
 * );
 * ```
 */

import { InvalidSanctionProgramError } from '../errors';
import { Authority } from './authority';
import { CountryCode } from './country-code';

export class SanctionProgram {
  private constructor(
    public readonly name: string,
    public readonly id: string,
    public readonly authority: Authority,
    public readonly country: CountryCode
  ) {}

  static create(
    name: string,
    id: string,
    authority: Authority,
    country: CountryCode
  ): SanctionProgram {
    const trimmedName = name.trim();
    const trimmedId = id.trim();

    if (trimmedName.length === 0) {
      throw new InvalidSanctionProgramError('Program name cannot be empty', {
        name,
        id
      });
    }

    if (trimmedId.length === 0) {
      throw new InvalidSanctionProgramError('Program ID cannot be empty', {
        name,
        id
      });
    }

    return new SanctionProgram(trimmedName, trimmedId, authority, country);
  }

  /**
   * Value Objects equality: программы равны если равны их ID
   */
  equals(other: SanctionProgram): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return `${this.name} (${this.id})`;
  }
}
