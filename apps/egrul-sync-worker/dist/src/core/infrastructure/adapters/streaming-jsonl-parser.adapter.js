"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingJsonlParserFactory = exports.StreamingJsonlParserAdapter = void 0;
const jsonl_parser_config_vo_1 = require("../../domain/value-objects/jsonl-parser-config.vo");
const json_parse_result_vo_1 = require("../../domain/value-objects/json-parse-result.vo");
const json_extractor_service_1 = require("../../domain/services/json-extractor.service");
/**
 * Streaming JSONL Parser Adapter
 *
 * @remarks
 * Parses JSONL streams without readline limitations.
 * Accumulates data chunks and extracts complete JSON objects.
 */
class StreamingJsonlParserAdapter {
    extractor = new json_extractor_service_1.JsonExtractorService();
    async parse(stream, callbacks, options = {}) {
        const config = jsonl_parser_config_vo_1.JsonlParserConfig.fromOptions(options);
        let buffer = '';
        let lineNumber = 0;
        let errorCount = 0;
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
                // Check buffer overflow
                if (this.extractor.isBufferOverflow(buffer, config.maxBufferSize)) {
                    this.handleOverflow(buffer, lineNumber, config, callbacks);
                    errorCount++;
                    buffer = '';
                }
                // Extract complete JSON objects
                const extraction = this.extractor.extractComplete(buffer);
                buffer = extraction.remaining;
                // Process each JSON string
                for (const jsonStr of extraction.jsonStrings) {
                    if (!jsonStr.trim())
                        continue;
                    lineNumber++;
                    void this.processLine(jsonStr, lineNumber, config, callbacks, (err) => {
                        if (err)
                            errorCount++;
                    });
                }
            });
            stream.on('end', () => {
                // Process remaining buffer
                if (buffer.trim()) {
                    lineNumber++;
                    const hasError = this.processLine(buffer, lineNumber, config, callbacks);
                    if (hasError)
                        errorCount++;
                }
                resolve({
                    processed: lineNumber,
                    errors: errorCount
                });
            });
            stream.on('error', (err) => {
                reject(err);
            });
        });
    }
    /**
     * Process single JSON line
     *
     * @returns true if there was an error
     */
    processLine(line, lineNumber, config, callbacks, onError) {
        const result = json_parse_result_vo_1.JsonParseResultFactory.tryParse(line, config.maxLogLength);
        if (result.success) {
            void callbacks.onSuccess({ entity: result.data, lineNumber });
            onError?.(false);
            return false;
        }
        void callbacks.onError({
            rawLine: result.rawLine,
            error: result.error,
            lineNumber
        });
        onError?.(true);
        return true;
    }
    /**
     * Handle buffer overflow error
     */
    handleOverflow(buffer, lineNumber, config, callbacks) {
        const overflowMsg = `Buffer overflow (${buffer.length} bytes), possible malformed JSON`;
        const error = new Error(overflowMsg);
        const rawLine = buffer.slice(0, config.maxLogLength);
        void callbacks.onError({ rawLine, error, lineNumber });
    }
}
exports.StreamingJsonlParserAdapter = StreamingJsonlParserAdapter;
/**
 * Factory for creating parser instances
 */
class StreamingJsonlParserFactory {
    static create() {
        return new StreamingJsonlParserAdapter();
    }
}
exports.StreamingJsonlParserFactory = StreamingJsonlParserFactory;
