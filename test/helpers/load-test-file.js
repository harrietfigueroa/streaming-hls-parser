import { createReadStream } from 'fs';
export var TestFiles;
(function (TestFiles) {
    TestFiles["VERY_LARGE_PLAYLIST"] = "./examples/very-large-playlist.m3u8";
    TestFiles["LIVE_PLAYLIST"] = "./examples/live-playlist.m3u8";
    TestFiles["MULTI_VARIANT_PLAYLIST"] = "./examples/multi-variant-playlist.m3u8";
    TestFiles["VOD_PLAYLIST"] = "./examples/vod-playlist.m3u8";
})(TestFiles || (TestFiles = {}));
/**
 * Load a test file as a Node.js Readable stream (for backward compatibility)
 */
export function loadTestFile(fileName) {
    return createReadStream(fileName, {
        encoding: 'utf-8',
    });
}
/**
 * Load a test file as an async iterable for use with Web Streams
 */
export function loadTestFileAsIterable(fileName) {
    return createReadStream(fileName, {
        encoding: 'utf-8',
    });
}
