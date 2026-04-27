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

import { InvalidUrlError, UnsafeUrlError } from '../errors';

export class SecureUrl {
  private static readonly ALLOWED_HOSTS = new Set([
    'eur-lex.europa.eu',
    'home.treasury.gov',
    'sanctionssearch.ofac.treas.gov',
    'gov.uk',
    'www.gov.uk',
    'un.org',
    'ec.europa.eu'
  ]);

  private constructor(
    private readonly url: string,
    public readonly hostname: string
  ) {}

  static create(url: string): SecureUrl {
    const trimmed = url.trim();

    if (trimmed.length === 0) {
      throw new InvalidUrlError('URL cannot be empty', { url });
    }

    try {
      const parsed = new URL(trimmed);

      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new InvalidUrlError('Only HTTP/HTTPS protocols allowed', {
          url: trimmed,
          protocol: parsed.protocol
        });
      }

      if (!SecureUrl.ALLOWED_HOSTS.has(parsed.hostname)) {
        throw new UnsafeUrlError('URL hostname not in whitelist', {
          url: trimmed,
          hostname: parsed.hostname,
          allowedHosts: Array.from(SecureUrl.ALLOWED_HOSTS)
        });
      }

      return new SecureUrl(trimmed, parsed.hostname);
    } catch (error) {
      if (error instanceof UnsafeUrlError || error instanceof InvalidUrlError) {
        throw error;
      }
      throw new InvalidUrlError('Invalid URL format', { url: trimmed, error });
    }
  }

  get value(): string {
    return this.url;
  }

  equals(other: SecureUrl): boolean {
    return this.url === other.url;
  }

  toString(): string {
    return this.url;
  }
}
