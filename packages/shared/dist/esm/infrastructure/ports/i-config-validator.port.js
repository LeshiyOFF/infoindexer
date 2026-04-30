"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
