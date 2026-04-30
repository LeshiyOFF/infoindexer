/**
 * Handle EGRUL + Sanctions full sync
 */
export declare function handleEgrulSync(message: string): Promise<void>;
/**
 * Handle sanctions-only sync
 */
export declare function handleSanctionsSync(): Promise<void>;
/**
 * Handle cache refresh
 */
export declare function handleRefreshCache(): Promise<void>;
