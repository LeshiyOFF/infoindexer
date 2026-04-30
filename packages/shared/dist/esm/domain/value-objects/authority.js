"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authority = void 0;
const errors_1 = require("../errors");
class Authority {
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
            throw new errors_1.InvalidSanctionProgramError('Authority name cannot be empty', {
                name,
                shortName
            });
        }
        if (trimmedShort.length === 0 || trimmedShort.length > 5) {
            throw new errors_1.InvalidSanctionProgramError('Authority short name must be 1-5 characters', { name, shortName });
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
exports.Authority = Authority;
