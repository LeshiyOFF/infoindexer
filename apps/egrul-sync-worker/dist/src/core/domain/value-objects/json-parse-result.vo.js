"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonParseResultFactory = void 0;
/**
 * Factory for JSON parse results
 */
class JsonParseResultFactory {
    /**
     * Create successful result
     */
    static success(data) {
        return { success: true, data };
    }
    /**
     * Create failure result
     */
    static failure(rawLine, error) {
        return { success: false, rawLine, error };
    }
    /**
     * Parse JSON string safely
     *
     * @param line - JSON string to parse
     * @param maxLogLength - Maximum length for rawLine in error case
     * @returns Parse result
     */
    static tryParse(line, maxLogLength) {
        try {
            const data = JSON.parse(line);
            return JsonParseResultFactory.success(data);
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const rawLine = line.length > maxLogLength
                ? line.slice(0, maxLogLength) + '...[truncated]'
                : line;
            return JsonParseResultFactory.failure(rawLine, error);
        }
    }
}
exports.JsonParseResultFactory = JsonParseResultFactory;
