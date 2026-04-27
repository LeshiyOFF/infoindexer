/**
 * Authority Value Object
 *
 * Authority (орган) который наложил санкцию
 *
 * @example
 * ```ts
 * const euCommission = Authority.create('European Commission', 'EC');
 * ```
 */
import { InvalidSanctionProgramError } from '../errors';
export class Authority {
    name;
    shortName;
    constructor(name, shortName) {
        this.name = name;
        this.shortName = shortName;
    }
    static create(name, shortName) {
        const trimmedName = name.trim();
        const trimmedShort = shortName.trim();
        if (trimmedName.length === 0) {
            throw new InvalidSanctionProgramError('Authority name cannot be empty', {
                name,
                shortName
            });
        }
        if (trimmedShort.length === 0 || trimmedShort.length > 5) {
            throw new InvalidSanctionProgramError('Authority short name must be 1-5 characters', { name, shortName });
        }
        return new Authority(trimmedName, trimmedShort.toUpperCase());
    }
    equals(other) {
        return this.shortName === other.shortName;
    }
    toString() {
        return `${this.shortName} — ${this.name}`;
    }
}
