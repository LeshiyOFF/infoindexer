/**
 * File System Certificate Provider Adapter
 *
 * @remarks
 * Infrastructure Layer: Implements ICertificateProvider port from Domain.
 * Reads CA certificate from file system.
 *
 * Architecture Pattern: Hexagonal / Ports & Adapters
 * - Port (Domain): ICertificateProvider
 * - Adapter (Infrastructure): FileSystemCertificateProvider
 *
 * Iteration 9.1: TLS Certificate Automation
 */
import type { ICertificateProvider } from './ports/i-certificate-provider.port';
/**
 * File System Certificate Provider
 *
 * @remarks
 * Reads CA certificate from local file system.
 * Synchronous implementation (fs.readFileSync).
 *
 * Usage:
 * ```ts
 * const provider = new FileSystemCertificateProvider();
 * const cert = provider.getCACert();
 * ```
 */
export declare class FileSystemCertificateProvider implements ICertificateProvider {
    readonly certPath: string;
    /**
     * Create file system certificate provider
     *
     * @param certPath - Path to CA certificate file
     *
     * @remarks
     * Default: ./docker/certs/ca-cert.pem
     * Can be overridden for testing or custom paths.
     */
    constructor(certPath?: string);
    /**
     * Get CA certificate content
     *
     * @returns CA certificate as Buffer
     * @throws {Error} If certificate file not found
     *
     * @remarks
     * Synchronous file read.
     * Throws helpful error message if file not found.
     */
    getCACert(): Buffer;
    /**
     * Check if certificate file exists
     *
     * @returns true if certificate file exists
     *
     * @remarks
     * Useful for pre-flight checks.
     */
    exists(): boolean;
}
/**
 * Factory function for creating file system certificate provider
 *
 * @param certPath - Optional custom certificate path
 * @returns ICertificateProvider interface (not concrete class)
 *
 * @remarks
 * Useful for dependency injection and testing.
 * Returns interface (not concrete class) for DIP compliance.
 *
 * @example
 * ```ts
 * import { createCertificateProvider } from '@shared/index';
 *
 * const provider = createCertificateProvider();
 * const cert = provider.getCACert();
 * ```
 */
export declare function createCertificateProvider(certPath?: string): ICertificateProvider;
