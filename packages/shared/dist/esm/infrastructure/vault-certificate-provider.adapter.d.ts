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
export interface VaultCertificateProviderOptions {
    readonly vault: VaultClient;
    readonly secretPath?: string;
    readonly disablePreload?: boolean;
}
export declare class VaultCertificateProvider implements ICertificateProvider {
    private readonly vault;
    private readonly secretPath;
    private cachedCert?;
    constructor(options: VaultCertificateProviderOptions);
    preload(): Promise<void>;
    getCACert(): Buffer;
    isLoaded(): boolean;
    reload(): Promise<void>;
}
export declare function createVaultCertificateProvider(options: VaultCertificateProviderOptions): ICertificateProvider;
export {};
