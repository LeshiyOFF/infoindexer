"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemCertificateProvider = void 0;
exports.createCertificateProvider = createCertificateProvider;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Default certificate paths
 *
 * @remarks
 * Relative to project root.
 */
const DEFAULT_CERT_PATH = './docker/certs/ca-cert.pem';
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
class FileSystemCertificateProvider {
    certPath;
    /**
     * Create file system certificate provider
     *
     * @param certPath - Path to CA certificate file
     *
     * @remarks
     * Default: ./docker/certs/ca-cert.pem
     * Can be overridden for testing or custom paths.
     */
    constructor(certPath) {
        this.certPath = certPath || path_1.default.resolve(process.cwd(), DEFAULT_CERT_PATH);
    }
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
    getCACert() {
        try {
            return fs_1.default.readFileSync(this.certPath);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`CA certificate not found at: ${this.certPath}\n` +
                    `Generate certificates first:\n` +
                    `  npm run setup:certs\n` +
                    `  or\n` +
                    `  node scripts/setup-certs.js`);
            }
            throw error;
        }
    }
    /**
     * Check if certificate file exists
     *
     * @returns true if certificate file exists
     *
     * @remarks
     * Useful for pre-flight checks.
     */
    exists() {
        return fs_1.default.existsSync(this.certPath);
    }
}
exports.FileSystemCertificateProvider = FileSystemCertificateProvider;
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
function createCertificateProvider(certPath) {
    return new FileSystemCertificateProvider(certPath);
}
