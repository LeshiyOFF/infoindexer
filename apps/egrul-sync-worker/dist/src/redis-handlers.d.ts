/**
 * Setup Redis subscriptions and message handlers
 */
export declare function setupRedisSubscriptions(): void;
/**
 * Register new operation
 */
export declare function registerOperation(type: 'egrul' | 'sanctions' | 'refresh'): AbortController;
/**
 * Abort operation by type
 */
export declare function abortOperation(type: 'egrul' | 'sanctions' | 'refresh'): boolean;
