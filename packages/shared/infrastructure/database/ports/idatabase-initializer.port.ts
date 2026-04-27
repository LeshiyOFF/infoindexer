/**
 * Database Initializer Port
 *
 * @remarks
 * Following Interface Segregation Principle (ISP): minimal interface
 * with single responsibility. Adapters implement this for different
 * database systems (ClickHouse, PostgreSQL, etc.).
 *
 * Part of Hexagonal Architecture: this is a Port that defines
 * the contract between the application layer and infrastructure layer.
 *
 * @packageDocumentation
 */

/**
 * Result of database initialization operation
 */
export interface DatabaseInitializationResult {
  /** True if initialization was successful */
  readonly success: boolean;

  /** Human-readable description of what was done */
  readonly message: string;

  /** Error details if success is false */
  readonly error?: string;
}

/**
 * Port for database initialization
 *
 * @remarks
 * Defines the contract for initializing a database. Implementations
 * should create the database if it doesn't exist and verify it's
 * ready for use.
 *
 * Implementations must be idempotent: calling initialize() multiple
 * times should have the same effect as calling it once.
 */
export interface IDatabaseInitializer {
  /**
   * Initialize the database
   *
   * @returns Promise that resolves with initialization result
   * @throws {Error} if initialization fails critically
   *
   * @remarks
   * Implementations should:
   * - Create database if not exists
   * - Verify database is accessible
   * - Return success even if database already existed (idempotent)
   */
  initialize(): Promise<DatabaseInitializationResult>;
}
