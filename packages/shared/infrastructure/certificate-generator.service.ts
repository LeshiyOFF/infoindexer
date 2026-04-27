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

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import type { CertificateGenerationOptions } from './ports/i-certificate-provider.port';

export class CertificateGenerator {
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
  static async generate(
    options: CertificateGenerationOptions = {}
  ): Promise<boolean> {
    const {
      outputDir = './docker/certs',
      validityDays = 365,
      caSubject = '/CN=InfoIndexer CA',
      serverSubject = '/CN=localhost',
      silent = false
    } = options;

    const caCertPath = path.join(outputDir, 'ca-cert.pem');

    // Check if already exists
    if (fs.existsSync(caCertPath)) {
      if (!silent) {
        console.log('✅ TLS certificates already exist');
      }
      return false;
    }

    // Create directory
    fs.mkdirSync(outputDir, { recursive: true });

    if (!silent) {
      console.log('🔐 Generating TLS certificates...');
    }

    // Generate CA certificate
    await this.runOpenSSL(
      [
        'req', '-x509', '-newkey', 'rsa:4096',
        '-keyout', path.join(outputDir, 'ca-key.pem'),
        '-out', caCertPath,
        '-days', String(validityDays),
        '-nodes',
        '-subj', caSubject
      ],
      silent
    );

    // Generate server certificate request
    await this.runOpenSSL(
      [
        'req', '-newkey', 'rsa:4096',
        '-keyout', path.join(outputDir, 'server-key.pem'),
        '-out', path.join(outputDir, 'server-req.pem'),
        '-nodes',
        '-subj', serverSubject
      ],
      silent
    );

    // Sign server certificate with CA
    await this.runOpenSSL(
      [
        'x509', '-req',
        '-in', path.join(outputDir, 'server-req.pem'),
        '-CA', caCertPath,
        '-CAkey', path.join(outputDir, 'ca-key.pem'),
        '-CAcreateserial',
        '-out', path.join(outputDir, 'server-cert.pem'),
        '-days', String(validityDays)
      ],
      silent
    );

    // Cleanup temporary file
    const reqPath = path.join(outputDir, 'server-req.pem');
    if (fs.existsSync(reqPath)) {
      fs.unlinkSync(reqPath);
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
  private static async runOpenSSL(
    args: string[],
    silent: boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cross-platform openssl command
      const openssl = process.platform === 'win32' ? 'openssl.exe' : 'openssl';

      const child = spawn(openssl, args, {
        stdio: silent ? 'pipe' : 'inherit'
      });

      child.on('error', (error) => {
        if (error.message.includes('ENOENT')) {
          reject(
            new Error(
              'OpenSSL not found. Please install OpenSSL:\n' +
              '  Windows: https://slproweb.com/products/Win32OpenSSL.html\n' +
              '  Linux: sudo apt install openssl\n' +
              '  macOS: brew install openssl'
            )
          );
        } else {
          reject(error);
        }
      });

      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
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
  static exists(outputDir: string = './docker/certs'): boolean {
    const caCert = path.join(outputDir, 'ca-cert.pem');
    const serverCert = path.join(outputDir, 'server-cert.pem');
    const serverKey = path.join(outputDir, 'server-key.pem');

    return (
      fs.existsSync(caCert) &&
      fs.existsSync(serverCert) &&
      fs.existsSync(serverKey)
    );
  }
}
