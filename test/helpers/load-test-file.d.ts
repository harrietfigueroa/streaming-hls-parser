import { Readable } from 'node:stream';
export declare enum TestFiles {
    VERY_LARGE_PLAYLIST = "./examples/very-large-playlist.m3u8",
    LIVE_PLAYLIST = "./examples/live-playlist.m3u8",
    MULTI_VARIANT_PLAYLIST = "./examples/multi-variant-playlist.m3u8",
    VOD_PLAYLIST = "./examples/vod-playlist.m3u8"
}
/**
 * Load a test file as a Node.js Readable stream (for backward compatibility)
 */
export declare function loadTestFile(fileName: TestFiles): Readable;
/**
 * Load a test file as an async iterable for use with Web Streams
 */
export declare function loadTestFileAsIterable(fileName: TestFiles): AsyncIterable<string>;
//# sourceMappingURL=load-test-file.d.ts.map