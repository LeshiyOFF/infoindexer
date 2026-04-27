/**
 * Value Object: JSON Parse Result
 *
 * @remarks
 * Type-safe result of JSON parsing operation.
 * Discriminated union for success/failure cases.
 */
export type JsonParseResult = {
    success: true;
    data: unknown;
} | {
    success: false;
    rawLine: string;
    error: Error;
};
/**
 * Factory for JSON parse results
 */
export declare class JsonParseResultFactory {
    /**
     * Create successful result
     */
    static success(data: unknown): JsonParseResult;
    /**
     * Create failure result
     */
    static failure(rawLine: string, error: Error): JsonParseResult;
    /**
     * Parse JSON string safely
     *
     * @param line - JSON string to parse
     * @param maxLogLength - Maximum length for rawLine in error case
     * @returns Parse result
     */
    static tryParse(line: string, maxLogLength: number): JsonParseResult;
}
