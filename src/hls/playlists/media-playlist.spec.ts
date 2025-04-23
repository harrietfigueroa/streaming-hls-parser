import { describe, expect, it } from 'vitest';
import { loadTestFile, TestFiles } from '../../../test/helpers/load-test-file';
import { MediaPlaylist } from './media-playlist';

describe('Media Playlist', (): void => {
    describe('fromStream', (): void => {
        it('should parse a Live Media Playlist', async (): Promise<void> => {
            const stream = loadTestFile(TestFiles.LIVE_PLAYLIST);
            const mediaPlaylist = await MediaPlaylist.fromStream(stream);

            expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
            expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
            expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(8);
            expect(mediaPlaylist['#EXT-X-MEDIA-SEQUENCE']).toBe(2680);
            expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeFalsy();
            expect(mediaPlaylist.size).toBe(3);
        });

        // it('should parse a Live Media Playlist from the web', async (): Promise<void> => {
        //     const url =
        //         'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8';
        //     const resp = await fetch(url);
        //     if (!resp.body) {
        //         throw new Error('Response body is null');
        //     }
        //     const mediaPlaylist = await MediaPlaylist.from(resp.body);

        //     expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
        //     expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
        //     expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(11);
        //     expect(mediaPlaylist['#EXT-X-MEDIA-SEQUENCE']).toBeUndefined();
        //     expect(mediaPlaylist['#EXT-X-ENDLIST']).toBe(true);
        //     expect(mediaPlaylist.size).toBe(64);
        // });

        it('should parse a VOD Media Playlist', async (): Promise<void> => {
            const stream = loadTestFile(TestFiles.VOD_PLAYLIST);
            const mediaPlaylist = await MediaPlaylist.fromStream(stream);

            expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
            expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
            expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(10);
            expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeTruthy();
            expect(mediaPlaylist.size).toBe(3);
        });

        it('should parse a Very Large Media Playlist', async (): Promise<void> => {
            const stream = loadTestFile(TestFiles.VERY_LARGE_PLAYLIST);
            const mediaPlaylist = await MediaPlaylist.fromStream(stream);

            expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
            expect(mediaPlaylist['#EXT-X-VERSION']).toBe(4);
            expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(6);
            expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeTruthy();
            expect(mediaPlaylist.size).toBe(11702);
        });
    });

    describe('fromString', (): void => {
        describe('Live Playlist', () => {
            it('should parse a Media Playlist', async (): Promise<void> => {
                const mediaPlaylist = await MediaPlaylist.fromString(`
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
                expect(mediaPlaylist.size).toBe(3);
            });
        });

        describe('VOD Playlist', () => {
            it('should parse a Media Playlist', async (): Promise<void> => {
                const mediaPlaylist = await MediaPlaylist.fromString(`
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
                expect(mediaPlaylist.size).toBe(3);
            });
        });
    });
    describe('toHLS', () => {
        it('should return the correct HLS string', async (): Promise<void> => {
            const input = `#EXTM3U
                    #EXT-X-TARGETDURATION:10
                    #EXT-X-VERSION:3
                    #EXTINF:9.009,
                    http://media.example.com/first.ts
                    #EXTINF:9.009,
                    http://media.example.com/second.ts
                    #EXTINF:3.003,
                    http://media.example.com/third.ts
                    #EXT-X-ENDLIST`;

            const mediaPlaylist = await MediaPlaylist.fromStream(input);
            const hls = mediaPlaylist.toHLS().split('\n');

            for (const [i, inputLine] of input.split('\n').entries()) {
                expect(hls[i].trim()).toEqual(inputLine.trim());
            }
        });

        //     it('should parse and stringify a Live Media Playlist from the web', async (): Promise<void> => {
        //         const url =
        //             'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8';
        //         const resp = await fetch(url);
        //         if (!resp.body) {
        //             throw new Error('Response body is null');
        //         }
        //         const mediaPlaylist = await MediaPlaylist.from(resp.body);
        //         const hls = mediaPlaylist.toHLS();
        //         ('https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8');
        //         const strResp = await (await fetch(url)).text();
        //         expect(hls).toEqual(strResp);
        //     });
    });
});
