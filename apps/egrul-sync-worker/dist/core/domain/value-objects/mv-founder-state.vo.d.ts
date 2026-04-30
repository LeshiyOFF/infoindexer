/**
 * Materialized View Founder State Value Object
 *
 * @remarks
 * Represents aggregated founder state from MV.
 * Immutable value object following DDD principles.
 *
 * MV stores: groupArrayState(founder_name)
 * View merges: groupArrayMerge(founders_state)
 */
export declare class MVFounderState {
    private readonly _founders;
    constructor(founders: readonly string[]);
    /**
     * Get filtered founders (non-empty names)
     */
    get filtered(): readonly string[];
    /**
     * Get all founders (including empty)
     */
    get all(): readonly string[];
    /**
     * Check if has any founders
     */
    get hasFounders(): boolean;
    /**
     * Count of non-empty founders
     */
    get count(): number;
    /**
     * Create empty state
     */
    static empty(): MVFounderState;
    /**
     * Create from array
     */
    static fromArray(founders: readonly string[]): MVFounderState;
}
