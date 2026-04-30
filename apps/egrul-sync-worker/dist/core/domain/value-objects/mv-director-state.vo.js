"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVDirectorState = void 0;
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
class MVDirectorState {
    _directors;
    constructor(directors) {
        this._directors = Object.freeze([...directors]);
    }
    /**
     * Get filtered directors (non-empty names)
     */
    get filtered() {
        return this._directors.filter(d => d !== '' && d !== null);
    }
    /**
     * Get all directors (including empty)
     */
    get all() {
        return this._directors;
    }
    /**
     * Check if has any directors
     */
    get hasDirectors() {
        return this._directors.some(d => d !== '' && d !== null);
    }
    /**
     * Count of non-empty directors
     */
    get count() {
        return this.filtered.length;
    }
    /**
     * Create empty state
     */
    static empty() {
        return new MVDirectorState([]);
    }
    /**
     * Create from array
     */
    static fromArray(directors) {
        return new MVDirectorState(directors);
    }
}
exports.MVDirectorState = MVDirectorState;
