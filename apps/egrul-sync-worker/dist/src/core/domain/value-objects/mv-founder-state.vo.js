"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVFounderState = void 0;
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
class MVFounderState {
    _founders;
    constructor(founders) {
        this._founders = Object.freeze([...founders]);
    }
    /**
     * Get filtered founders (non-empty names)
     */
    get filtered() {
        return this._founders.filter(f => f !== '' && f !== null);
    }
    /**
     * Get all founders (including empty)
     */
    get all() {
        return this._founders;
    }
    /**
     * Check if has any founders
     */
    get hasFounders() {
        return this._founders.some(f => f !== '' && f !== null);
    }
    /**
     * Count of non-empty founders
     */
    get count() {
        return this.filtered.length;
    }
    /**
     * Create empty state
     */
    static empty() {
        return new MVFounderState([]);
    }
    /**
     * Create from array
     */
    static fromArray(founders) {
        return new MVFounderState(founders);
    }
}
exports.MVFounderState = MVFounderState;
