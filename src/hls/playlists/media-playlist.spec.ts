import { describe } from 'node:test';
import { loadTestFile, TestFiles } from '../../../test/helpers/load-test-file';
import { MediaPlaylist } from './media-playlist';
import * as HLS from 'hls-parser';
import { readFileSync } from 'fs';
import exp from 'constants';

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
                expect(mediaPlaylist.size).toBe(3);
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
                expect(mediaPlaylist.size).toBe(3);
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
                expect(mediaPlaylist.size).toBe(3);
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

            const mediaPlaylist = await MediaPlaylist.from(input);
            const hls = mediaPlaylist.toHLS().split('\n');

            for (const [i, inputLine] of input.split('\n').entries()) {
                expect(hls[i]).toEqual(inputLine.trim());
            }
        });
    });

    describe('speed test', () => {
        let mine: any;
        let theirs: any;
        it('should go fast', async (): Promise<void> => {
            HLS.setOptions({
                silent: false,
                strictMode: false,
            });
            //parse
            const inputStr = readFileSync('./examples/very-large-playlist.m3u8').toString();
            const theirsStart = Date.now();
            theirs = await HLS.parse(inputStr);
            const theirsEnd = Date.now();
            console.log('Theirs took', theirsEnd - theirsStart, 'ms');

            // mine stream
            const mineStreamStart = Date.now();
            mine = await MediaPlaylist.from(inputStr);
            const mineStreamEnd = Date.now();
            console.log('Mine string took', mineStreamEnd - mineStreamStart, 'ms');

            const input = loadTestFile(TestFiles.VERY_LARGE_PLAYLIST);
            const start = Date.now();
            mine = await MediaPlaylist.from(input);
            const end = Date.now();
            console.log('Mine took', end - start, 'ms');

            //stringify
            const startStringify = Date.now();
            const mineString = mine.toHLS();
            const endStringify = Date.now();
            console.log('Mine stringify took', endStringify - startStringify, 'ms');

            const theirsStartStringify = Date.now();
            const theirsString = HLS.stringify(theirs);
            const theirsEndStringify = Date.now();
            console.log('Theirs stringify took', theirsEndStringify - theirsStartStringify, 'ms');

            // console.log('Mine', mineString);
            expect(mineString).toEqual(theirsString);
        });
    });
});
