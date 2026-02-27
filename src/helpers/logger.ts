/**
 * Debug logging helper using the debug package (optional peer dependency)
 *
 * When the debug package is installed, users can enable logging via:
 *   DEBUG=hls:* node app.js        # Enable all HLS logs
 *   DEBUG=hls:parse node app.js    # Enable only parse logs
 *   DEBUG=hls:parse,hls:validate   # Enable multiple namespaces
 *
 * When debug is not installed, logging is a no-op (zero overhead).
 */

type DebugFunction = {
    (formatter: any, ...args: any[]): void;
    namespace: string;
    enabled: boolean;
};

type CreateDebugFunction = (namespace: string) => DebugFunction;

/**
 * Try to import debug package, fall back to no-op if not available
 */
let createDebug: CreateDebugFunction;

try {
    // Try to load debug package (optional peer dependency)
    // Using dynamic import to handle both ESM and potential absence
    const debugModule = await import('debug').catch(() => null);

    if (debugModule?.default) {
        createDebug = debugModule.default as CreateDebugFunction;
    } else {
        throw new Error('debug package not available');
    }
} catch {
    // Fallback: no-op function when debug is not installed
    const noop = (() => {}) as any;
    noop.namespace = '';
    noop.enabled = false;

    createDebug = () => noop;
}

/**
 * HLS Parser debug loggers
 *
 * Each namespace represents a different part of the parsing process:
 * - hls:parse    - Tokenization and line parsing
 * - hls:segment  - Media segment building
 * - hls:playlist - Playlist construction
 * - hls:validate - Validation and error checking
 * - hls:encode   - Stringification/encoding
 * - hls:stream   - Stream processing
 */
export const log = {
    /**
     * Parser/tokenizer logs
     * Example: log.parse('Tokenizing line %d: %s', lineNum, content)
     */
    parse: createDebug('hls:parse'),

    /**
     * Media segment building logs
     * Example: log.segment('Added segment %d with URI: %s', index, uri)
     */
    segment: createDebug('hls:segment'),

    /**
     * Playlist construction logs
     * Example: log.playlist('Building %s playlist with %d segments', type, count)
     */
    playlist: createDebug('hls:playlist'),

    /**
     * Validation and error logs
     * Example: log.validate('Validation error in %s: %o', tag, error)
     */
    validate: createDebug('hls:validate'),

    /**
     * Encoding/stringification logs
     * Example: log.encode('Encoding tag %s: %o', tagName, value)
     */
    encode: createDebug('hls:encode'),

    /**
     * Stream processing logs
     * Example: log.stream('Processing chunk %d (%d bytes)', chunkNum, size)
     */
    stream: createDebug('hls:stream'),
};

/**
 * Check if debug logging is enabled for any namespace
 */
export const isDebugEnabled = (): boolean => {
    return log.parse.enabled ||
           log.segment.enabled ||
           log.playlist.enabled ||
           log.validate.enabled ||
           log.encode.enabled ||
           log.stream.enabled;
};
