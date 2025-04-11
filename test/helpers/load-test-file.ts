import { createReadStream } from 'fs';
import { dirname } from 'node:path';
import { Readable } from 'node:stream';

export enum TestFiles {
    LIVE_PLAYLIST = `./examples/live-playlist.m3u8`,
    MULTI_VARIANT_PLAYLIST = `./examples/multi-variant-playlist.m3u8`,
    VOD_PLAYLIST = `./examples/vod-playlist.m3u8`,
}
export function loadTestFile(fileName: TestFiles): Readable {
    return createReadStream(fileName);
}
