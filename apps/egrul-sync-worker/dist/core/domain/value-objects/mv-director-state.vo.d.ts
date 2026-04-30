/**
 * Materialized View Director State Value Object
 *
 * @remarks
 * Represents aggregated director state from MV.
 * Immutable value object following DDD principles.
 *
 * MV stores: groupArrayState(director_name)
 * View merges: groupArrayMerge(directors_state)
 */
export declare class MVDirectorState {
    private readonly _directors;
    constructor(directors: readonly string[]);
    /**
     * Get filtered directors (non-empty names)
     */
    get filtered(): readonly string[];
    /**
     * Get all directors (including empty)
     */
    get all(): readonly string[];
    /**
     * Check if has any directors
     */
    get hasDirectors(): boolean;
    /**
     * Count of non-empty directors
     */
    get count(): number;
    /**
     * Create empty state
     */
    static empty(): MVDirectorState;
    /**
     * Create from array
     */
    static fromArray(directors: readonly string[]): MVDirectorState;
}
