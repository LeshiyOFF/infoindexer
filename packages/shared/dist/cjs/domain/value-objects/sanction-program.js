"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionProgram = void 0;
const errors_1 = require("../errors");
class SanctionProgram {
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
            throw new errors_1.InvalidSanctionProgramError('Program name cannot be empty', {
                name,
                id
            });
        }
        if (trimmedId.length === 0) {
            throw new errors_1.InvalidSanctionProgramError('Program ID cannot be empty', {
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
exports.SanctionProgram = SanctionProgram;
