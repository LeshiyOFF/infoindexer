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
import { Authority } from './authority';
import { CountryCode } from './country-code';
export declare class SanctionProgram {
    readonly name: string;
    readonly id: string;
    readonly authority: Authority;
    readonly country: CountryCode;
    private constructor();
    static create(name: string, id: string, authority: Authority, country: CountryCode): SanctionProgram;
    /**
     * Value Objects equality: программы равны если равны их ID
     */
    equals(other: SanctionProgram): boolean;
    toString(): string;
}
