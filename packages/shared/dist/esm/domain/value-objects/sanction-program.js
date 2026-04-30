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
export class SanctionProgram {
    name;
    id;
    authority;
    country;
    constructor(name, id, authority, country) {
        this.name = name;
        this.id = id;
        this.authority = authority;
        this.country = country;
    }
    static create(name, id, authority, country) {
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
    equals(other) {
        return this.id === other.id;
    }
    toString() {
        return `${this.name} (${this.id})`;
    }
}
