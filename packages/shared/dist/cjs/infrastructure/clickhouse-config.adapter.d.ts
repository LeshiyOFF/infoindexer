import type { IClickHouseConfig, ClickHouseSettings, TLSSettings } from './ports/i-clickhouse-config.port';
import type { ICertificateProvider } from './ports/i-certificate-provider.port';
/**
 * ClickHouse configuration adapter (Hexagonal / Ports & Adapters)
 * Infrastructure Layer: Implements IClickHouseConfig port from Domain.
 */
export declare class ClickHouseConfigAdapter implements IClickHouseConfig {
    private readonly certProvider?;
    readonly url: string;
    readonly username: string;
    readonly password: string | undefined;
    readonly database: string;
    readonly request_timeout: number;
    readonly max_open_connections: number;
    readonly max_idle_connections: number;
    readonly connection_idle_timeout: number;
    readonly clickhouse_settings: ClickHouseSettings;
    readonly tls?: TLSSettings;
    constructor(certProvider?: ICertificateProvider | undefined);
    /**
     * Build ClickHouse HTTP/HTTPS URL from environment
     * @throws {Error} If CLICKHOUSE_HOST is invalid (empty string)
     * @returns ClickHouse endpoint (http://host:8123 or https://host:8443)
     */
    private buildUrl;
    private getUsername;
    private getPassword;
    /**
     * Build ClickHouse settings from constants
     * @returns ClickHouse session settings object
     */
    private buildSettings;
    /**
     * Build TLS settings from environment and certificate provider
     * @throws {Error} If CLICKHOUSE_SECURE=true but certificate not found
     * @returns TLS settings object or undefined (if disabled)
     */
    private buildTLSSettings;
}
/**
 * Factory function for creating ClickHouse configuration.
 * Returns IClickHouseConfig interface (not concrete class).
 */
export declare function createClickHouseConfig(): IClickHouseConfig;
