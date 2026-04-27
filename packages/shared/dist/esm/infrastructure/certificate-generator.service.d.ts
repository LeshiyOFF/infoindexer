/**
 * Certificate Generator Service
 *
 * @remarks
 * Application Layer: Business logic for certificate generation.
 * Part of Iteration 9.1: TLS Certificate Automation.
 *
 * Responsibilities:
 * - Generate CA and server certificates
 * - Check existence before generation (idempotent)
 * - Cross-platform: Windows, Linux, macOS
 *
 * Architecture:
 * - Uses openssl binary (must be installed)
 * - Async/await for child process spawning
 */
import type { CertificateGenerationOptions } from './ports/i-certificate-provider.port';
export declare class CertificateGenerator {
    /**
     * Generate certificates if they don't exist
     *
     * @param options - Generation options
     * @returns true if generated, false if already exists
     * @throws {Error} If openssl not found or generation fails
     *
     * @remarks
     * Idempotent: safe to call multiple times.
     * First call generates, subsequent calls return false.
     */
    static generate(options?: CertificateGenerationOptions): Promise<boolean>;
    /**
     * Run openssl command with arguments
     *
     * @param args - OpenSSL command line arguments
     * @param silent - Suppress output
     * @throws {Error} If openssl not found or command fails
     *
     * @remarks
     * Cross-platform: uses 'openssl' on Unix/Mac, 'openssl.exe' on Windows.
     * Spawns child process and waits for completion.
     */
    private static runOpenSSL;
    /**
     * Check if certificates exist
     *
     * @param outputDir - Certificate directory
     * @returns true if all certificates exist
     *
     * @remarks
     * Checks for CA cert, server cert, and server key.
     */
    static exists(outputDir?: string): boolean;
}
