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
export declare class Authority {
    readonly name: string;
    readonly shortName: string;
    private constructor();
    static create(name: string, shortName: string): Authority;
    equals(other: Authority): boolean;
    toString(): string;
}
