"use strict";
/**
 * Certificate Provider Port
 *
 * @remarks
 * Domain Layer: Defines the contract for certificate retrieval.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): This interface
 * - Adapter (Infrastructure Layer): FileSystemCertificateProvider, VaultCertificateProvider (future)
 *
 * Iteration 9.1: TLS Certificate Automation
 * Iteration 11: Secrets Management (Vault integration)
 *
 * @see https://clickhouse.com/docs/en/interfaces/tcp/
 */
Object.defineProperty(exports, "__esModule", { value: true });
