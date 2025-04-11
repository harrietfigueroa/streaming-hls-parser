import { describe } from 'node:test';
import { loadTestFile, TestFiles } from '../../../test/helpers/load-test-file';
import { MediaPlaylist } from './media-playlist';
import { MultivariantPlaylist } from './multivariant-playlist';
import { VariantStream } from './variant-stream';

describe('Multivariant Playlist', (): void => {
    describe('fromStream', (): void => {
        describe('Playlist', () => {
            it('should parse a Multivariant Playlist', async (): Promise<void> => {
                const stream = loadTestFile(TestFiles.MULTI_VARIANT_PLAYLIST);
                const multivariantPlaylist = await MultivariantPlaylist.from(stream);

                expect(multivariantPlaylist).toBeInstanceOf(MultivariantPlaylist);
                expect(multivariantPlaylist['#EXT-X-VERSION']).toBeUndefined();
            });
        });
    });

    describe('fromString', (): void => {
        describe('Playlist', () => {
            it('should parse a Multivariant Playlist', async (): Promise<void> => {
                const multivariantPlaylist = await MultivariantPlaylist.from(`#EXTM3U
                    #EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000
                    http://example.com/low.m3u8
                    #EXT-X-STREAM-INF:BANDWIDTH=2560000,AVERAGE-BANDWIDTH=2000000
                    http://example.com/mid.m3u8
                    #EXT-X-STREAM-INF:BANDWIDTH=7680000,AVERAGE-BANDWIDTH=6000000
                    http://example.com/hi.m3u8
                    #EXT-X-STREAM-INF:BANDWIDTH=65000,CODECS="mp4a.40.5"
                    http://example.com/audio-only.m3u8`);

                expect(multivariantPlaylist).toBeInstanceOf(MultivariantPlaylist);
                expect(multivariantPlaylist['#EXT-X-VERSION']).toBeUndefined();
                expect(multivariantPlaylist.size).toBe(4);

                console.dir(JSON.stringify(multivariantPlaylist as any), { depth: 5 });
                for (const variantStream of multivariantPlaylist.values()) {
                    expect(variantStream).toBeInstanceOf(VariantStream);
                    expect(variantStream['BANDWIDTH']).toBeDefined();
                }
            });
        });
    });
});
