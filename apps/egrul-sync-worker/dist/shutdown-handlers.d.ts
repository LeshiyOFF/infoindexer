/**
 * Handle shutdown signals (SIGINT, SIGTERM)
 */
export declare function handleShutdownSignal(signal: string): Promise<void>;
/**
 * Save progress for active operations
 */
export declare function saveActiveOperationsProgress(): Promise<number>;
export declare function getActiveOperations(): Map<string, {
    controller: AbortController;
    type: "egrul" | "sanctions" | "refresh";
}>;
export declare function deleteActiveOperation(type: string): void;
