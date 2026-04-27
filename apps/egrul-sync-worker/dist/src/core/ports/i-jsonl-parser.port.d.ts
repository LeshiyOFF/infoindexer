/**
 * Port for JSON Lines (JSONL) stream parsing
 *
 * @remarks
 * Defines contract for parsing streaming JSONL data.
 * Follows Dependency Inversion Principle - high-level modules depend on this abstraction.
 *
 * Architecture: Port (interface) in Hexagonal pattern
 */
import type { Readable } from 'stream';
/**
 * Result of successful JSON parsing
 */
export interface JsonlParseSuccess {
    /** Parsed JSON object */
    entity: unknown;
    /** Line number in stream (for logging) */
    lineNumber: number;
}
/**
 * Result of failed JSON parsing
 */
export interface JsonlParseError {
    /** Raw line content (truncated for logs) */
    rawLine: string;
    /** Parse error */
    error: Error;
    /** Line number */
    lineNumber: number;
}
/**
 * Result of JSONL stream parsing
 */
export interface JsonlParseResult {
    /** Total lines processed */
    processed: number;
    /** Number of parse errors */
    errors: number;
}
/**
 * Options for JSONL parser behavior
 */
export interface JsonlParserOptions {
    /** Maximum buffer size before overflow (bytes) */
    maxBufferSize?: number;
    /** Maximum line length for error logging (chars) */
    maxLogLength?: number;
}
/**
 * Callbacks for parser events
 */
export interface JsonlParserCallbacks {
    /** Called on successful parse */
    onSuccess: (result: JsonlParseSuccess) => void | Promise<void>;
    /** Called on parse error */
    onError: (error: JsonlParseError) => void | Promise<void>;
}
/**
 * Port for JSONL stream parsing operations
 *
 * @remarks
 * Implemented by adapters that handle different streaming strategies.
 * High-level services depend on this Port, not on concrete implementations.
 */
export interface IJsonlParserPort {
    /**
     * Parse JSONL stream and emit events
     *
     * @param stream - Readable stream with JSONL data
     * @param callbacks - Event callbacks for success/error
     * @param options - Parser configuration options
     * @returns Parse statistics
     */
    parse(stream: Readable, callbacks: JsonlParserCallbacks, options?: JsonlParserOptions): Promise<JsonlParseResult>;
}
