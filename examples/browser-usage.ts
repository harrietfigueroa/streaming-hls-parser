/**
 * Browser Usage Examples for streaming-hls-parser
 *
 * This file demonstrates how to use the HLS parser in web browsers
 * with various Web APIs like fetch, File API, and custom streams.
 */

import { HLS, MediaPlaylist, MultivariantPlaylist } from '../src/index';

/**
 * Example 1: Parse a playlist from a fetch() response
 *
 * The fetch API returns a Response with a body that's a ReadableStream<Uint8Array>,
 * which is perfect for streaming parsing.
 */
export async function fetchAndParsePlaylist(url: string): Promise<MediaPlaylist | MultivariantPlaylist> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Option 1: Stream the response body for efficient parsing
    // This is ideal for large playlists as it processes chunks as they arrive
    if (response.body) {
        // Auto-detect playlist type from streaming data
        // Note: Auto-detection requires reading the entire stream first
        const text = await response.text();
        return HLS.parse(text);
    }

    throw new Error('Response body is null');
}

/**
 * Helper to convert ReadableStream to AsyncIterable
 * Browser ReadableStreams are not directly async iterable in all environments
 */
async function* readableStreamToAsyncIterable<T>(stream: ReadableStream<T>): AsyncIterable<T> {
    const reader = stream.getReader();
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

/**
 * Example 2: Parse a specific playlist type from streaming response
 *
 * When you know the playlist type in advance, you can parse directly
 * from the stream for better performance.
 */
export async function fetchMediaPlaylist(url: string): Promise<MediaPlaylist> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    // Convert ReadableStream to AsyncIterable
    const iterable = readableStreamToAsyncIterable(response.body);

    // Parse directly from the stream
    return HLS.parseMediaPlaylist(iterable);
}

/**
 * Example 3: Parse from a File input (user file upload)
 *
 * The File API provides text() method to get the content as a string.
 */
export async function parseFromFile(file: File): Promise<MediaPlaylist | MultivariantPlaylist> {
    // Convert the file to text
    const text = await file.text();

    // Parse with auto-detection
    return HLS.parse(text);
}

/**
 * Example 4: Parse from File with streaming
 *
 * For large files, streaming is more efficient than reading all at once.
 */
export async function parseFromFileStreaming(file: File): Promise<MediaPlaylist> {
    const stream = file.stream();

    // Convert ReadableStream to AsyncIterable
    const iterable = readableStreamToAsyncIterable(stream);

    // Parse directly from the file stream
    return HLS.parseMediaPlaylist(iterable);
}

/**
 * Example 5: Use a Reviver to transform tokens during parsing
 *
 * Revivers let you modify or filter tokens as they're parsed.
 */
export async function parseWithReviver(url: string): Promise<MediaPlaylist> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    // Convert ReadableStream to AsyncIterable
    const iterable = readableStreamToAsyncIterable(response.body);

    // Parse with a reviver that logs each token
    return HLS.parseMediaPlaylist(iterable, (token) => {
        console.log('Parsing token:', token.type);
        return token;
    });
}

/**
 * Example 6: Validate a playlist and check for errors
 */
export async function validatePlaylist(url: string): Promise<{
    playlist: MediaPlaylist | MultivariantPlaylist;
    isValid: boolean;
    errors: any[];
}> {
    const response = await fetch(url);
    const text = await response.text();

    // Parse and validate
    const { playlist, errors } = HLS.validate(text);

    return {
        playlist,
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Example 7: Create a custom ReadableStream from chunks
 *
 * You can create your own streams for testing or special use cases.
 */
export async function parseFromCustomStream(): Promise<MediaPlaylist> {
    // Create a custom ReadableStream that emits HLS chunks
    const stream = new ReadableStream<string>({
        start(controller) {
            controller.enqueue('#EXTM3U\n');
            controller.enqueue('#EXT-X-VERSION:3\n');
            controller.enqueue('#EXT-X-TARGETDURATION:10\n');
            controller.enqueue('#EXTINF:9.009,\n');
            controller.enqueue('segment1.ts\n');
            controller.enqueue('#EXT-X-ENDLIST\n');
            controller.close();
        }
    });

    // Convert ReadableStream to AsyncIterable
    const iterable = readableStreamToAsyncIterable(stream);

    return HLS.parseMediaPlaylist(iterable);
}

/**
 * Example 8: Convert a playlist back to HLS string
 */
export function stringifyPlaylist(playlist: MediaPlaylist | MultivariantPlaylist): string {
    // Convert playlist back to HLS format
    return HLS.stringify(playlist);
}

/**
 * Example 9: Modify a playlist and stringify with custom line endings
 */
export async function modifyAndStringifyPlaylist(url: string): Promise<string> {
    const response = await fetch(url);
    const text = await response.text();

    // Parse the playlist
    const playlist = HLS.parse(text) as MediaPlaylist;

    // Modify something (example: change target duration)
    if (playlist['#EXT-X-TARGETDURATION']) {
        // MediaPlaylist properties use the full tag names
        // This is read-only in the current implementation
        console.log('Target duration:', playlist['#EXT-X-TARGETDURATION']);
    }

    // Stringify with custom line endings
    return HLS.stringify(playlist, undefined, {
        lineEndings: '\r\n' // Windows line endings
    });
}

/**
 * Example 10: Use with async/await in a React component
 */
export async function useInReactComponent() {
    // Example React usage pattern
    const url = 'https://example.com/playlist.m3u8';

    try {
        const playlist = await fetchMediaPlaylist(url);

        // Use the playlist data in your component
        // MediaPlaylist uses full tag names as property keys
        console.log('Media Sequence:', playlist['#EXT-X-MEDIA-SEQUENCE']);
        console.log('Target Duration:', playlist['#EXT-X-TARGETDURATION']);
        console.log('Segments:', playlist.size); // MediaPlaylist extends Map

        // Access individual segments
        // MediaPlaylist extends Map<string, MediaSegment>
        playlist.forEach((segment, uri) => {
            console.log(`Segment ${uri}:`, segment);
        });

    } catch (error) {
        console.error('Failed to load playlist:', error);
    }
}

/**
 * Example 11: Progress tracking with streaming
 *
 * Track parsing progress as chunks are processed.
 */
export async function parseWithProgress(url: string, onProgress: (percent: number) => void): Promise<MediaPlaylist> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = Number(response.headers.get('content-length')) || 0;

    if (!response.body) {
        throw new Error('Response body is null');
    }

    let receivedLength = 0;

    // Create a new stream that tracks progress
    const progressStream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const reader = response.body!.getReader();

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                receivedLength += value.length;

                if (contentLength > 0) {
                    const percent = (receivedLength / contentLength) * 100;
                    onProgress(percent);
                }

                controller.enqueue(value);
            }

            controller.close();
        }
    });

    // Convert ReadableStream to AsyncIterable
    const iterable = readableStreamToAsyncIterable(progressStream);

    // Parse from the progress-tracking stream
    return HLS.parseMediaPlaylist(iterable);
}
