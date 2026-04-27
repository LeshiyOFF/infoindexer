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

/**
 * Certificate Provider Interface
 *
 * @remarks
 * Abstracts the source of TLS certificates.
 * High-level modules depend on this abstraction (DIP), not on concrete implementations.
 *
 * Design Decision: Synchronous API
 * - Constructor of ClickHouseConfigAdapter is synchronous
 * - Async providers (Vault) should preload certificates at app startup
 * - See Iteration 11 for Vault integration pattern
 *
 * Implementations:
 * - FileSystemCertificateProvider: reads from file system (Iteration 9.1)
 * - VaultCertificateProvider: reads from HashiCorp Vault with preload (Iteration 11)
 */
export interface ICertificateProvider {
  /**
   * Get CA certificate content (synchronous)
   *
   * @returns CA certificate as Buffer
   * @throws {Error} If certificate not found or cannot be read
   *
   * @remarks
   * Synchronous by design.
   * For async sources (Vault), preload at application startup.
   */
  getCACert(): Buffer;
}

/**
 * Certificate generation options
 *
 * @remarks
 * Configuration for automatic certificate generation.
 * Used by CertificateGenerator service.
 */
export interface CertificateGenerationOptions {
  /**
   * Output directory for certificates
   *
   * @remarks
   * Default: './docker/certs'
   * Directory will be created if not exists.
   */
  readonly outputDir?: string;

  /**
   * Certificate validity in days
   *
   * @remarks
   * Default: 365 days (1 year)
   * ClickHouse uses TLSv1.2+ with certificate validation.
   */
  readonly validityDays?: number;

  /**
   * CA certificate subject
   *
   * @remarks
   * Default: "/CN=InfoIndexer CA"
   * OpenSSL subject string for CA certificate.
   */
  readonly caSubject?: string;

  /**
   * Server certificate subject
   *
   * @remarks
   * Default: "/CN=localhost"
   * OpenSSL subject string for server certificate.
   */
  readonly serverSubject?: string;

  /**
   * Silent mode - suppress console output
   *
   * @remarks
   * Default: false (shows progress)
   * Set to true for non-interactive environments (CI/CD).
   */
  readonly silent?: boolean;
}
