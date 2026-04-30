"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
class CertificateGenerator {
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
    static async generate(options = {}) {
        const { outputDir = './docker/certs', validityDays = 365, caSubject = '/CN=InfoIndexer CA', serverSubject = '/CN=localhost', silent = false } = options;
        const caCertPath = path_1.default.join(outputDir, 'ca-cert.pem');
        // Check if already exists
        if (fs_1.default.existsSync(caCertPath)) {
            if (!silent) {
                console.log('✅ TLS certificates already exist');
            }
            return false;
        }
        // Create directory
        fs_1.default.mkdirSync(outputDir, { recursive: true });
        if (!silent) {
            console.log('🔐 Generating TLS certificates...');
        }
        // Generate CA certificate
        await this.runOpenSSL([
            'req', '-x509', '-newkey', 'rsa:4096',
            '-keyout', path_1.default.join(outputDir, 'ca-key.pem'),
            '-out', caCertPath,
            '-days', String(validityDays),
            '-nodes',
            '-subj', caSubject
        ], silent);
        // Generate server certificate request
        await this.runOpenSSL([
            'req', '-newkey', 'rsa:4096',
            '-keyout', path_1.default.join(outputDir, 'server-key.pem'),
            '-out', path_1.default.join(outputDir, 'server-req.pem'),
            '-nodes',
            '-subj', serverSubject
        ], silent);
        // Sign server certificate with CA
        await this.runOpenSSL([
            'x509', '-req',
            '-in', path_1.default.join(outputDir, 'server-req.pem'),
            '-CA', caCertPath,
            '-CAkey', path_1.default.join(outputDir, 'ca-key.pem'),
            '-CAcreateserial',
            '-out', path_1.default.join(outputDir, 'server-cert.pem'),
            '-days', String(validityDays)
        ], silent);
        // Cleanup temporary file
        const reqPath = path_1.default.join(outputDir, 'server-req.pem');
        if (fs_1.default.existsSync(reqPath)) {
            fs_1.default.unlinkSync(reqPath);
        }
        if (!silent) {
            console.log('✅ TLS certificates generated successfully');
            console.log(`   Location: ${outputDir}`);
        }
        return true;
    }
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
    static async runOpenSSL(args, silent) {
        return new Promise((resolve, reject) => {
            // Cross-platform openssl command
            const openssl = process.platform === 'win32' ? 'openssl.exe' : 'openssl';
            const child = (0, child_process_1.spawn)(openssl, args, {
                stdio: silent ? 'pipe' : 'inherit'
            });
            child.on('error', (error) => {
                if (error.message.includes('ENOENT')) {
                    reject(new Error('OpenSSL not found. Please install OpenSSL:\n' +
                        '  Windows: https://slproweb.com/products/Win32OpenSSL.html\n' +
                        '  Linux: sudo apt install openssl\n' +
                        '  macOS: brew install openssl'));
                }
                else {
                    reject(error);
                }
            });
            child.on('exit', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`OpenSSL command failed with exit code ${code}`));
                }
            });
        });
    }
    /**
     * Check if certificates exist
     *
     * @param outputDir - Certificate directory
     * @returns true if all certificates exist
     *
     * @remarks
     * Checks for CA cert, server cert, and server key.
     */
    static exists(outputDir = './docker/certs') {
        const caCert = path_1.default.join(outputDir, 'ca-cert.pem');
        const serverCert = path_1.default.join(outputDir, 'server-cert.pem');
        const serverKey = path_1.default.join(outputDir, 'server-key.pem');
        return (fs_1.default.existsSync(caCert) &&
            fs_1.default.existsSync(serverCert) &&
            fs_1.default.existsSync(serverKey));
    }
}
exports.CertificateGenerator = CertificateGenerator;
