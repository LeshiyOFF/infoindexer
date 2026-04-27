/**
 * Value Object: JSONL Parser Configuration
 *
 * @remarks
 * Encapsulates parser configuration constants.
 * Immutable, factory-based creation following DDD principles.
 */
export declare class JsonlParserConfig {
    readonly maxBufferSize: number;
    readonly maxLogLength: number;
    private static readonly DEFAULT_MAX_BUFFER_SIZE;
    private static readonly DEFAULT_MAX_LOG_LENGTH;
    private constructor();
    /**
     * Create default configuration
     */
    static createDefault(): JsonlParserConfig;
    /**
     * Create with custom buffer size
     */
    static withMaxBufferSize(maxBufferSize: number): JsonlParserConfig;
    /**
     * Create from options (partial)
     */
    static fromOptions(options: {
        maxBufferSize?: number;
        maxLogLength?: number;
    }): JsonlParserConfig;
}
