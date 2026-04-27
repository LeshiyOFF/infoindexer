"use strict";
/**
 * Secure URL Value Object
 *
 * Secure URL с whitelist проверкой
 *
 * @example
 * ```ts
 * const url = SecureUrl.create('https://eur-lex.europa.eu/...');
 * url.hostname  // 'eur-lex.europa.eu'
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureUrl = void 0;
const errors_1 = require("../errors");
class SecureUrl {
    url;
    hostname;
    static ALLOWED_HOSTS = new Set([
        'eur-lex.europa.eu',
        'home.treasury.gov',
        'sanctionssearch.ofac.treas.gov',
        'gov.uk',
        'www.gov.uk',
        'un.org',
        'ec.europa.eu'
    ]);
    constructor(url, hostname) {
        this.url = url;
        this.hostname = hostname;
    }
    static create(url) {
        const trimmed = url.trim();
        if (trimmed.length === 0) {
            throw new errors_1.InvalidUrlError('URL cannot be empty', { url });
        }
        try {
            const parsed = new URL(trimmed);
            if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
                throw new errors_1.InvalidUrlError('Only HTTP/HTTPS protocols allowed', {
                    url: trimmed,
                    protocol: parsed.protocol
                });
            }
            if (!SecureUrl.ALLOWED_HOSTS.has(parsed.hostname)) {
                throw new errors_1.UnsafeUrlError('URL hostname not in whitelist', {
                    url: trimmed,
                    hostname: parsed.hostname,
                    allowedHosts: Array.from(SecureUrl.ALLOWED_HOSTS)
                });
            }
            return new SecureUrl(trimmed, parsed.hostname);
        }
        catch (error) {
            if (error instanceof errors_1.UnsafeUrlError || error instanceof errors_1.InvalidUrlError) {
                throw error;
            }
            throw new errors_1.InvalidUrlError('Invalid URL format', { url: trimmed, error });
        }
    }
    get value() {
        return this.url;
    }
    equals(other) {
        return this.url === other.url;
    }
    toString() {
        return this.url;
    }
}
exports.SecureUrl = SecureUrl;
