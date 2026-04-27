/**
 * Adapter: Streaming JSONL Parser
 *
 * @remarks
 * Implements IJsonlParserPort using Node.js streams.
 * Handles chunk accumulation and JSON extraction.
 *
 * Architecture: Adapter in Hexagonal pattern
 * Implements IJsonlParserPort (Port)
 */
import type { Readable } from 'stream';
import { type IJsonlParserPort, type JsonlParserCallbacks, type JsonlParserOptions, type JsonlParseResult } from '../../ports/i-jsonl-parser.port';
/**
 * Streaming JSONL Parser Adapter
 *
 * @remarks
 * Parses JSONL streams without readline limitations.
 * Accumulates data chunks and extracts complete JSON objects.
 */
export declare class StreamingJsonlParserAdapter implements IJsonlParserPort {
    private readonly extractor;
    parse(stream: Readable, callbacks: JsonlParserCallbacks, options?: JsonlParserOptions): Promise<JsonlParseResult>;
    /**
     * Process single JSON line
     *
     * @returns true if there was an error
     */
    private processLine;
    /**
     * Handle buffer overflow error
     */
    private handleOverflow;
}
/**
 * Factory for creating parser instances
 */
export declare class StreamingJsonlParserFactory {
    static create(): IJsonlParserPort;
}
