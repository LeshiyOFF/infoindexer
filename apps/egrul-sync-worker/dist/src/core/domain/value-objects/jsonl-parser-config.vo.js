"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonlParserConfig = void 0;
/**
 * Value Object: JSONL Parser Configuration
 *
 * @remarks
 * Encapsulates parser configuration constants.
 * Immutable, factory-based creation following DDD principles.
 */
class JsonlParserConfig {
    maxBufferSize;
    maxLogLength;
    static DEFAULT_MAX_BUFFER_SIZE = 1024 * 1024; // 1MB
    static DEFAULT_MAX_LOG_LENGTH = 500; // chars
    constructor(maxBufferSize, maxLogLength) {
        this.maxBufferSize = maxBufferSize;
        this.maxLogLength = maxLogLength;
    }
    /**
     * Create default configuration
     */
    static createDefault() {
        return new JsonlParserConfig(JsonlParserConfig.DEFAULT_MAX_BUFFER_SIZE, JsonlParserConfig.DEFAULT_MAX_LOG_LENGTH);
    }
    /**
     * Create with custom buffer size
     */
    static withMaxBufferSize(maxBufferSize) {
        return new JsonlParserConfig(maxBufferSize, JsonlParserConfig.DEFAULT_MAX_LOG_LENGTH);
    }
    /**
     * Create from options (partial)
     */
    static fromOptions(options) {
        return new JsonlParserConfig(options.maxBufferSize ?? JsonlParserConfig.DEFAULT_MAX_BUFFER_SIZE, options.maxLogLength ?? JsonlParserConfig.DEFAULT_MAX_LOG_LENGTH);
    }
}
exports.JsonlParserConfig = JsonlParserConfig;
