import { createReadStream } from 'fs';
import { Readable } from 'node:stream';

export enum TestFiles {
    VERY_LARGE_PLAYLIST = `./examples/very-large-playlist.m3u8`,
    LIVE_PLAYLIST = `./examples/live-playlist.m3u8`,
    MULTI_VARIANT_PLAYLIST = `./examples/multi-variant-playlist.m3u8`,
    VOD_PLAYLIST = `./examples/vod-playlist.m3u8`,
}

/**
 * Load a test file as a Node.js Readable stream (for backward compatibility)
 */
export function loadTestFile(fileName: TestFiles): Readable {
    return createReadStream(fileName, {
        encoding: 'utf-8',
    });
}

/**
 * Load a test file as an async iterable for use with Web Streams
 */
export function loadTestFileAsIterable(fileName: TestFiles): AsyncIterable<string> {
    return createReadStream(fileName, {
        encoding: 'utf-8',
    });
}
