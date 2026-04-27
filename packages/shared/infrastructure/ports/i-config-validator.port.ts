/**
 * Config Validator Port
 *
 * @remarks
 * Domain Layer: Defines the contract for configuration validation.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): This interface
 * - Adapter (Infrastructure Layer): ClickHouseConfigValidatorAdapter
 *
 * Design Decision: Separate from RBAC Manager
 * - Validation is read-only, RBAC is write operations
 * - Allows for different validation strategies
 * - Easier to test in isolation
 *
 * Iteration 10.2: Config Validation
 */

/**
 * Configuration validation check result
 *
 * @remarks
 * Represents a single validation check with expected vs actual values.
 */
export interface ConfigValidationCheck {
  /** Check name/description */
  readonly name: string;

  /** Expected value */
  readonly expected: unknown;

  /** Actual value (or error message) */
  readonly actual: unknown;

  /** true if check passed */
  readonly passed: boolean;
}

/**
 * Configuration validation result
 *
 * @remarks
 * Aggregated result of all validation checks.
 */
export interface ConfigValidationResult {
  /** Overall validation status */
  readonly valid: boolean;

  /** Individual check results */
  readonly checks: readonly ConfigValidationCheck[];

  /** Error messages from failed checks */
  readonly errors: readonly string[];
}

/**
 * Configuration validation options
 *
 * @remarks
 * Optional configuration for validation behavior.
 */
export interface ConfigValidationOptions {
  /** Skip user existence checks */
  readonly skipUsers?: boolean;

  /** Skip profile checks */
  readonly skipProfiles?: boolean;

  /** Skip quota checks */
  readonly skipQuotas?: boolean;

  /** Skip audit log checks */
  readonly skipAudit?: boolean;

  /** Custom list of users to validate */
  readonly requiredUsers?: readonly string[];

  /** Custom list of profiles to validate */
  readonly requiredProfiles?: readonly string[];

  /** Custom list of quotas to validate */
  readonly requiredQuotas?: readonly string[];
}

/**
 * ClickHouse Config Validator Interface
 *
 * @remarks
 * Abstracts configuration validation logic.
 * High-level modules depend on this abstraction (DIP).
 *
 * Implementations:
 * - ClickHouseConfigValidatorAdapter: SQL-based validation (Iteration 10.2)
 *
 * @example
 * ```ts
 * const result = await configValidator.validate();
 * if (!result.valid) {
 *   console.error('Config validation failed:', result.errors);
 * }
 * ```
 */
export interface IClickHouseConfigValidator {
  /**
   * Validate ClickHouse configuration
   *
   * @param options - Optional validation overrides
   * @returns Validation result with detailed checks
   *
   * @remarks
   * Performs the following checks by default:
   * - max_concurrent_queries setting
   * - Required users exist
   * - Required profiles exist
   * - Required quotas exist
   * - Query log is enabled
   */
  validate(options?: ConfigValidationOptions): Promise<ConfigValidationResult>;

  /**
   * Validate a single setting
   *
   * @param name - Setting name
   * @param expected - Expected value
   * @returns Validation check result
   *
   * @remarks
   * Useful for ad-hoc validation checks.
   */
  validateSetting(name: string, expected: unknown): Promise<ConfigValidationCheck>;
}
