/**
 * Vault Certificate Provider Adapter
 *
 * @remarks
 * Infrastructure Layer: Retrieves CA certificate from HashiCorp Vault.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Iteration 11: Secrets Management
 */

import type { ICertificateProvider } from './ports/i-certificate-provider.port';
import type NodeVault from 'node-vault';

type VaultClient = NodeVault.client;

const DEFAULT_SECRET_PATH = 'secret/infoindexer';
const CERT_KEY = 'ca-cert';

export interface VaultCertificateProviderOptions {
  readonly vault: VaultClient;
  readonly secretPath?: string;
  readonly disablePreload?: boolean;
}

export class VaultCertificateProvider implements ICertificateProvider {
  private readonly vault: VaultClient;
  private readonly secretPath: string;
  private cachedCert?: Buffer;

  constructor(options: VaultCertificateProviderOptions) {
    this.vault = options.vault;
    this.secretPath = options.secretPath ?? DEFAULT_SECRET_PATH;

    if (!options.disablePreload) {
      this.preload().catch((error) => {
        throw new Error(
          `Failed to preload certificate from Vault: ${error instanceof Error ? error.message : String(error)}`
        );
      });
    }
  }

  async preload(): Promise<void> {
    try {
      const fullPath = `${this.secretPath}/${CERT_KEY}`;
      const response = await this.vault.read(fullPath);

      const certData = response?.data?.data?.[CERT_KEY] ?? response?.data?.[CERT_KEY];

      if (typeof certData !== 'string') {
        throw new Error(`Certificate data not found at ${fullPath}`);
      }

      this.cachedCert = Buffer.from(certData, 'utf-8');
    } catch (error) {
      if ((error as Error).message?.includes('Invalid path')) {
        throw new Error(
          `Vault secret not found at: ${this.secretPath}/${CERT_KEY}\n` +
          `Ensure secret exists: vault kv put ${this.secretPath} ${CERT_KEY}=<cert>`
        );
      }
      throw error;
    }
  }

  getCACert(): Buffer {
    if (!this.cachedCert) {
      throw new Error(
        'Certificate not preloaded from Vault. ' +
        'Ensure preload() completed or disable disablePreload option.'
      );
    }
    return this.cachedCert;
  }

  isLoaded(): boolean {
    return this.cachedCert !== undefined;
  }

  async reload(): Promise<void> {
    this.cachedCert = undefined;
    await this.preload();
  }
}

export function createVaultCertificateProvider(
  options: VaultCertificateProviderOptions
): ICertificateProvider {
  return new VaultCertificateProvider(options);
}
