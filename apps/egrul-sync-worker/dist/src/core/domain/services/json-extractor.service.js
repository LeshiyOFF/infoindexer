"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonExtractorService = void 0;
/**
 * Domain Service: JSON Extractor
 *
 * @remarks
 * Extracts complete JSON objects from buffer.
 * Handles nested structures and multi-line JSON.
 *
 * SOLID: SRP - only extracts JSON from text
 */
class JsonExtractorService {
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
    extractComplete(buffer) {
        const jsonStrings = [];
        let depth = 0;
        let inString = false;
        let escapeNext = false;
        let startIdx = -1;
        let remaining = buffer;
        for (let i = 0; i < buffer.length; i++) {
            const char = buffer[i];
            const prevChar = i > 0 ? buffer[i - 1] : '';
            // Handle escape sequences inside strings
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === '\\' && inString) {
                escapeNext = true;
                continue;
            }
            // Track string boundaries
            if (char === '"') {
                const isEscapedQuote = prevChar === '\\' && !escapeNext;
                if (!isEscapedQuote) {
                    inString = !inString;
                }
                continue;
            }
            // Ignore characters inside strings
            if (inString)
                continue;
            // Track brace depth
            if (char === '{') {
                if (depth === 0) {
                    startIdx = i;
                }
                depth++;
            }
            else if (char === '}') {
                if (depth > 0) {
                    depth--;
                    if (depth === 0 && startIdx >= 0) {
                        // Found complete JSON object
                        const jsonStr = buffer.slice(startIdx, i + 1);
                        jsonStrings.push(jsonStr);
                        remaining = buffer.slice(i + 1);
                        // Reset for next iteration
                        buffer = remaining;
                        i = -1;
                        startIdx = -1;
                    }
                }
            }
        }
        return { jsonStrings, remaining };
    }
    /**
     * Check if buffer has exceeded safe size
     *
     * @param buffer - Buffer to check
     * @param maxSize - Maximum allowed size
     * @returns true if buffer is too large
     */
    isBufferOverflow(buffer, maxSize) {
        return buffer.length > maxSize;
    }
}
exports.JsonExtractorService = JsonExtractorService;
