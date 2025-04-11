import { describe } from 'node:test';
import { loadTestFile, TestFiles } from '../../../test/helpers/load-test-file';
import { MediaPlaylist } from './media-playlist';

describe('Media Playlist', (): void => {
    describe('fromStream', (): void => {
        describe('Live Playlist', () => {
            it('should parse a Media Playlist', async (): Promise<void> => {
                const stream = loadTestFile(TestFiles.LIVE_PLAYLIST);
                const mediaPlaylist = await MediaPlaylist.from(stream);

                expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
                expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
                expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(8);
                expect(mediaPlaylist['#EXT-X-MEDIA-SEQUENCE']).toBe(2680);
                expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeFalsy();
            });
        });

        describe('VOD Playlist', () => {
            it('should parse a Media Playlist', async (): Promise<void> => {
                const stream = loadTestFile(TestFiles.VOD_PLAYLIST);
                const mediaPlaylist = await MediaPlaylist.from(stream);

                expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
                expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
                expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(10);
                expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeTruthy();
            });
        });
    });

    describe('fromString', (): void => {
        describe('Live Playlist', () => {
            it('should parse a Media Playlist', async (): Promise<void> => {
                const mediaPlaylist = await MediaPlaylist.from(`
                        #EXTM3U
                        #EXT-X-VERSION:3
                        #EXT-X-TARGETDURATION:8
                        #EXT-X-MEDIA-SEQUENCE:2680
                        #EXTINF:7.975,
                        https://priv.example.com/fileSequence2680.ts
                        #EXTINF:7.941,
                        https://priv.example.com/fileSequence2681.ts
                        #EXTINF:7.975,
                        https://priv.example.com/fileSequence2682.ts`);

                expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
                expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
                expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(8);
                expect(mediaPlaylist['#EXT-X-MEDIA-SEQUENCE']).toBe(2680);
                expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeFalsy();
            });
        });

        describe('VOD Playlist', () => {
            it('should parse a Media Playlist', async (): Promise<void> => {
                const mediaPlaylist = await MediaPlaylist.from(`
                    #EXTM3U
                    #EXT-X-TARGETDURATION:10
                    #EXT-X-VERSION:3
                    #EXTINF:9.009,
                    http://media.example.com/first.ts
                    #EXTINF:9.009,
                    http://media.example.com/second.ts
                    #EXTINF:3.003,
                    http://media.example.com/third.ts
                    #EXT-X-ENDLIST`);

                expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
                expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
                expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(10);
                expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeTruthy();
            });
        });
    });
});
