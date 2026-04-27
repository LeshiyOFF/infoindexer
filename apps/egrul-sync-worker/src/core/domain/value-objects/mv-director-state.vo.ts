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
export class MVDirectorState {
  private readonly _directors: readonly string[];

  constructor(directors: readonly string[]) {
    this._directors = Object.freeze([...directors]);
  }

  /**
   * Get filtered directors (non-empty names)
   */
  get filtered(): readonly string[] {
    return this._directors.filter(d => d !== '' && d !== null);
  }

  /**
   * Get all directors (including empty)
   */
  get all(): readonly string[] {
    return this._directors;
  }

  /**
   * Check if has any directors
   */
  get hasDirectors(): boolean {
    return this._directors.some(d => d !== '' && d !== null);
  }

  /**
   * Count of non-empty directors
   */
  get count(): number {
    return this.filtered.length;
  }

  /**
   * Create empty state
   */
  static empty(): MVDirectorState {
    return new MVDirectorState([]);
  }

  /**
   * Create from array
   */
  static fromArray(directors: readonly string[]): MVDirectorState {
    return new MVDirectorState(directors);
  }
}
