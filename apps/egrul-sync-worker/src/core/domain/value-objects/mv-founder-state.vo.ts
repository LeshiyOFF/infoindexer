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
export class MVFounderState {
  private readonly _founders: readonly string[];

  constructor(founders: readonly string[]) {
    this._founders = Object.freeze([...founders]);
  }

  /**
   * Get filtered founders (non-empty names)
   */
  get filtered(): readonly string[] {
    return this._founders.filter(f => f !== '' && f !== null);
  }

  /**
   * Get all founders (including empty)
   */
  get all(): readonly string[] {
    return this._founders;
  }

  /**
   * Check if has any founders
   */
  get hasFounders(): boolean {
    return this._founders.some(f => f !== '' && f !== null);
  }

  /**
   * Count of non-empty founders
   */
  get count(): number {
    return this.filtered.length;
  }

  /**
   * Create empty state
   */
  static empty(): MVFounderState {
    return new MVFounderState([]);
  }

  /**
   * Create from array
   */
  static fromArray(founders: readonly string[]): MVFounderState {
    return new MVFounderState(founders);
  }
}
