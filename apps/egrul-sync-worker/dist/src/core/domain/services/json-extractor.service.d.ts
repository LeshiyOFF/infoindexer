/**
 * Domain Service: JSON Extractor
 *
 * @remarks
 * Extracts complete JSON objects from buffer.
 * Handles nested structures and multi-line JSON.
 *
 * SOLID: SRP - only extracts JSON from text
 */
export declare class JsonExtractorService {
    /**
     * Extract complete JSON objects from buffer
     *
     * @remarks
     * Algorithm tracks brace nesting depth to identify complete JSON objects.
     * Handles string literals and escape sequences correctly.
     *
     * @param buffer - Text buffer with possibly incomplete JSON
     * @returns Extracted JSON strings and remaining buffer content
     */
    extractComplete(buffer: string): {
        jsonStrings: string[];
        remaining: string;
    };
    /**
     * Check if buffer has exceeded safe size
     *
     * @param buffer - Buffer to check
     * @param maxSize - Maximum allowed size
     * @returns true if buffer is too large
     */
    isBufferOverflow(buffer: string, maxSize: number): boolean;
}
