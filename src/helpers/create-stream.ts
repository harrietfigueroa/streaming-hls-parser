import { HlsLexicalTransformer } from '../stream-transformers/hls-lexical.transformer';
import { HlsParseTransformer } from '../stream-transformers/hls-parse.transformer';
import { NewlineTransformer } from '../stream-transformers/newline.transformer';
import { LexicalToken, Reviver } from '../parser/parser.interfaces';

/**
 * Helper to convert an async iterable to a ReadableStream
 * Polyfill for ReadableStream.from() which is only in newer environments
 */
function toReadableStream<T>(source: Iterable<T> | AsyncIterable<T>): ReadableStream<T> {
    // Check if ReadableStream.from is available (Node.js 20+, modern browsers)
    // @ts-expect-error - ReadableStream.from exists in newer environments but not in all DOM typings
    if (typeof ReadableStream.from === 'function') {
        // @ts-expect-error - ReadableStream.from exists in newer environments but not in all DOM typings
        return ReadableStream.from(source as AsyncIterable<T>);
    }

    // Fallback implementation for older environments
    return new ReadableStream<T>({
        async start(controller) {
            try {
                for await (const chunk of source) {
                    controller.enqueue(chunk);
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        }
    });
}

/**
 * Creates a streaming pipeline for parsing HLS playlists
 *
 * Uses Web Streams API for cross-platform compatibility (browsers, Node.js 16.5+, Deno, Bun)
 *
 * Pipeline stages:
 * 1. NewlineTransformer - Splits input into complete lines
 * 2. HlsLexicalTransformer - Tokenizes each line
 * 3. HlsParseTransformer - Parses and validates tokens (with optional reviver)
 *
 * @param source - Any iterable or async iterable of strings or Uint8Arrays
 * @param reviver - Optional function to transform parsed tokens
 * @returns AsyncIterable of parsed LexicalTokens
 *
 * @example
 * ```typescript
 * // From fetch response (browser)
 * const response = await fetch('playlist.m3u8');
 * for await (const token of createStream(response.body)) {
 *   console.log(token);
 * }
 *
 * // From file stream (Node.js)
 * import { createReadStream } from 'fs';
 * const stream = createReadStream('playlist.m3u8');
 * for await (const token of createStream(stream)) {
 *   console.log(token);
 * }
 * ```
 */
export async function* createStream<
    Input extends Iterable<string> | AsyncIterable<string | Uint8Array>
>(source: Input, reviver?: Reviver): AsyncIterable<LexicalToken> {
    // Convert input to ReadableStream using polyfill if needed
    const inputStream = toReadableStream(source as AsyncIterable<string | Uint8Array>);

    // Pipe through the transformation pipeline
    const transformedStream = inputStream
        .pipeThrough(new NewlineTransformer())
        .pipeThrough(new HlsLexicalTransformer())
        .pipeThrough(new HlsParseTransformer(reviver));

    // Get a reader from the stream
    const reader = transformedStream.getReader();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield value;
        }
    } finally {
        reader.releaseLock();
    }
}
