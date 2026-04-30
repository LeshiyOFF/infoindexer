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
export {};
