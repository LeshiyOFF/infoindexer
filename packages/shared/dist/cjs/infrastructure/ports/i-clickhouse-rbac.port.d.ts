/**
 * ClickHouse RBAC Port
 *
 * @remarks
 * Domain Layer: Defines the contract for user management.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): This interface
 * - Adapter (Infrastructure Layer): ClickHouseRBACAdapter
 *
 * Design Decision: Separate from Config Adapter
 * - User management is distinct from configuration
 * - Allows for different implementations (SQL vs XML)
 * - Easier testing with mock adapter
 *
 * Iteration 10: RBAC + Users
 * Iteration 11: Potential Vault integration for passwords
 */
/**
 * ClickHouse user profile
 *
 * @remarks
 * Represents a ClickHouse user with connection settings.
 */
export interface ClickHouseUser {
    /** Username (unique identifier) */
    readonly username: string;
    /** Password (plaintext, will be hashed by ClickHouse) */
    readonly password: string;
    /** Network access restriction (default: all) */
    readonly networks?: readonly string[];
    /** Settings profile name */
    readonly profile: string;
    /** Quota name */
    readonly quota: string;
    /** Allowed databases (empty = all) */
    readonly databases?: readonly string[];
    /** Access management flag (can manage other users) */
    readonly accessManagement?: boolean;
    /** Readonly flag */
    readonly readonly?: boolean;
}
/**
 * User creation result
 */
export interface UserCreationResult {
    /** Username that was created */
    readonly username: string;
    /** true if user was created, false if already exists */
    readonly created: boolean;
    /** Error message if operation failed */
    readonly error?: string;
}
/**
 * User existence check result
 */
export interface UserExistenceResult {
    /** Username that was checked */
    readonly username: string;
    /** true if user exists */
    readonly exists: boolean;
}
/**
 * ClickHouse RBAC Manager Interface
 *
 * @remarks
 * Abstracts user management operations.
 * High-level modules depend on this abstraction (DIP).
 *
 * Implementations:
 * - ClickHouseRBACAdapter: SQL-based implementation (Iteration 10)
 *
 * @example
 * ```ts
 * await rbacManager.createUser({
 *   username: 'infoindexer_worker',
 *   password: 'secure_password',
 *   profile: 'workers',
 *   quota: 'default',
 *   databases: ['infoindexer']
 * });
 * ```
 */
export interface IClickHouseRBACManager {
    /**
     * Create a ClickHouse user
     *
     * @param user - User configuration
     * @returns Creation result with success flag
     *
     * @remarks
     * Idempotent: returns created=false if user already exists.
     * Uses IF NOT EXISTS clause in SQL.
     */
    createUser(user: ClickHouseUser): Promise<UserCreationResult>;
    /**
     * Check if user exists
     *
     * @param username - Username to check
     * @returns Existence result
     */
    userExists(username: string): Promise<UserExistenceResult>;
    /**
     * Disable default user
     *
     * @remarks
     * Removes default user or sets empty password.
     * Security best practice for production.
     *
     * @returns true if disabled successfully
     */
    disableDefaultUser(): Promise<boolean>;
    /**
     * Grant database access to user
     *
     * @param username - Username
     * @param database - Database name
     * @returns true if granted successfully
     */
    grantDatabaseAccess(username: string, database: string): Promise<boolean>;
    /**
     * Get all users
     *
     * @returns Array of usernames
     *
     * @remarks
     * Useful for validation and diagnostics.
     */
    getAllUsers(): Promise<string[]>;
}
/**
 * User initialization configuration
 *
 * @remarks
 * Credentials for creating ClickHouse users.
 * In production, these should come from environment variables.
 */
export interface UserInitConfig {
    /** Admin user password (can manage other users) */
    readonly adminPassword: string;
    /** Worker user password (background jobs) */
    readonly workerPassword: string;
    /** API user password (read-only API access) */
    readonly apiPassword: string;
    /** Database name to grant access to */
    readonly database: string;
    /** Disable default user (security best practice) */
    readonly disableDefault?: boolean;
}
/**
 * User initialization result
 */
export interface UserInitResult {
    /** Overall success flag */
    readonly success: boolean;
    /** Number of users created */
    readonly createdCount: number;
    /** Number of users that already existed */
    readonly skippedCount: number;
    /** Details for each user */
    readonly details: Array<{
        readonly username: string;
        readonly created: boolean;
        readonly error?: string;
    }>;
    /** Whether default user was disabled */
    readonly defaultDisabled: boolean;
}
