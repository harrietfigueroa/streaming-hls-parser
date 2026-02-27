/**
 * Node.js Usage Examples for streaming-hls-parser
 *
 * This file demonstrates how to use the HLS parser in Node.js
 * with file streams, HTTP requests, and other Node.js-specific APIs.
 */

import { HLS, MediaPlaylist, MultivariantPlaylist, playlistTagRegistry } from '../src/index';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import * as z from 'zod';

/**
 * Example 1: Parse from a file path (simple)
 *
 * The simplest way to parse an HLS file in Node.js.
 */
export async function parseFromFilePath(filePath: string): Promise<MediaPlaylist | MultivariantPlaylist> {
    // Read the entire file
    const content = await readFile(filePath, 'utf-8');

    // Parse with auto-detection
    return HLS.parse(content);
}

/**
 * Example 2: Parse from a file stream
 *
 * For large files, streaming is more memory-efficient.
 */
export async function parseFromFileStream(filePath: string): Promise<MediaPlaylist> {
    // Create a readable stream
    const stream = createReadStream(filePath, { encoding: 'utf-8' });

    // Parse from the stream
    // Node.js Readable streams are async iterables
    return HLS.parseMediaPlaylist(stream);
}

/**
 * Example 3: Parse from HTTP/HTTPS request
 *
 * Using Node.js built-in https module.
 */
export async function parseFromHttps(url: string): Promise<MediaPlaylist | MultivariantPlaylist> {
    const https = await import('https');

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP error! status: ${response.statusCode}`));
                return;
            }

            // Parse directly from the response stream
            // The response is a Readable stream
            HLS.parseMediaPlaylist(response)
                .then(resolve)
                .catch(reject);
        }).on('error', reject);
    });
}

/**
 * Helper to convert ReadableStream to AsyncIterable (for Node.js fetch)
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
 * Example 4: Parse with fetch in Node.js 18+
 *
 * Node.js 18+ has native fetch support.
 */
export async function parseWithNodeFetch(url: string): Promise<MediaPlaylist> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    // Convert ReadableStream to AsyncIterable
    const iterable = readableStreamToAsyncIterable(response.body);

    // Parse from the fetch response body
    return HLS.parseMediaPlaylist(iterable);
}

/**
 * Example 5: Parse with a reviver function
 *
 * Revivers let you modify or filter tokens during parsing.
 */
export async function parseWithReviver(filePath: string): Promise<MediaPlaylist> {
    const stream = createReadStream(filePath, { encoding: 'utf-8' });

    // Parse with a reviver that logs each segment
    return HLS.parseMediaPlaylist(stream, (token) => {
        if (token.type === 'URI') {
            console.log('Found segment:', token.value);
        }
        return token;
    });
}

/**
 * Example 6: Validate a playlist from a file
 */
export async function validatePlaylistFromFile(filePath: string): Promise<{
    playlist: MediaPlaylist | MultivariantPlaylist;
    isValid: boolean;
    errors: any[];
}> {
    const content = await readFile(filePath, 'utf-8');

    // Parse and validate
    const { playlist, errors } = HLS.validate(content);

    return {
        playlist,
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Example 7: Parse and re-write with modifications
 */
export async function modifyPlaylist(inputPath: string, outputPath: string): Promise<void> {
    const { writeFile } = await import('fs/promises');

    // Parse the input file
    const content = await readFile(inputPath, 'utf-8');
    const playlist = HLS.parse(content) as MediaPlaylist;

    // Inspect the playlist
    // MediaPlaylist properties use full tag names
    if (playlist['#EXT-X-TARGETDURATION']) {
        console.log('Target duration:', playlist['#EXT-X-TARGETDURATION']);
    }

    // Convert back to HLS string
    const output = HLS.stringify(playlist);

    // Write to output file
    await writeFile(outputPath, output, 'utf-8');
}

/**
 * Example 8: Process a large playlist in streaming mode
 *
 * This demonstrates processing each token as it's parsed.
 */
export async function streamProcessPlaylist(filePath: string): Promise<void> {
    const { createStream } = await import('../src/helpers/create-stream');
    const stream = createReadStream(filePath, { encoding: 'utf-8' });

    // Create a streaming parser
    const tokenStream = createStream(stream);

    // Process each token as it arrives
    for await (const token of tokenStream) {
        // Do something with each token
        if (token.type === '#EXTINF') {
            console.log('Segment duration:', token.value);
        }
    }
}

/**
 * Example 9: Parse from Buffer
 */
export async function parseFromBuffer(buffer: Buffer): Promise<MediaPlaylist | MultivariantPlaylist> {
    const content = buffer.toString('utf-8');
    return HLS.parse(content);
}

/**
 * Example 10: Create a custom async iterable
 */
export async function parseFromCustomIterable(): Promise<MediaPlaylist> {
    // Create a custom async iterable
    async function* generateHlsLines() {
        yield '#EXTM3U\n';
        yield '#EXT-X-VERSION:3\n';
        yield '#EXT-X-TARGETDURATION:10\n';
        yield '#EXTINF:9.009,\n';
        yield 'segment1.ts\n';
        yield '#EXT-X-ENDLIST\n';
    }

    return HLS.parseMediaPlaylist(generateHlsLines());
}

/**
 * Example 11: Parse and extract specific information
 */
export async function extractPlaylistInfo(filePath: string): Promise<{
    type: 'media' | 'multivariant';
    version?: z.infer<typeof playlistTagRegistry['#EXT-X-VERSION']>;
    targetDuration?: z.infer<typeof playlistTagRegistry['#EXT-X-TARGETDURATION']>;
    segmentCount?: number;
    streamCount?: number;
}> {
    const content = await readFile(filePath, 'utf-8');
    const playlist = HLS.parse(content);

    if (playlist instanceof MediaPlaylist) {
        return {
            type: 'media',
            version: playlist['#EXT-X-VERSION'],
            targetDuration: playlist['#EXT-X-TARGETDURATION'],
            segmentCount: playlist.size, // MediaPlaylist extends Map
        };
    } else {
        return {
            type: 'multivariant',
            version: playlist['#EXT-X-VERSION'],
            streamCount: playlist.size, // MultivariantPlaylist extends Map
        };
    }
}

/**
 * Example 12: Batch process multiple playlists
 */
export async function batchProcessPlaylists(filePaths: string[]): Promise<void> {
    const results = await Promise.all(
        filePaths.map(async (path) => {
            try {
                const info = await extractPlaylistInfo(path);
                return { path, success: true, info };
            } catch (error) {
                return {
                    path,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        })
    );

    results.forEach((result) => {
        if (result.success) {
            console.log(`✓ ${result.path}:`, result.info);
        } else {
            console.log(`✗ ${result.path}:`, result.error);
        }
    });
}

/**
 * Example 13: Watch a file for changes and re-parse
 */
export async function watchAndParse(filePath: string, onChange: (playlist: MediaPlaylist | MultivariantPlaylist) => void): Promise<void> {
    const { watch } = await import('fs');

    // Parse initially
    let playlist = await parseFromFilePath(filePath);
    onChange(playlist);

    // Watch for changes
    watch(filePath, async (eventType) => {
        if (eventType === 'change') {
            try {
                playlist = await parseFromFilePath(filePath);
                onChange(playlist);
            } catch (error) {
                console.error('Failed to parse updated playlist:', error);
            }
        }
    });
}
