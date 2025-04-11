import { describe } from 'node:test';
import { loadTestFile, TestFiles } from '../../../test/helpers/load-test-file';
import { MediaPlaylist } from './media-playlist';
import * as HLS from 'hls-parser';
import { createReadStream, readFileSync } from 'fs';
import exp from 'constants';

describe('Media Playlist', (): void => {
    describe('fromStream', (): void => {
        it('should parse a Live Media Playlist', async (): Promise<void> => {
            const stream = loadTestFile(TestFiles.LIVE_PLAYLIST);
            const mediaPlaylist = await MediaPlaylist.from(stream);

            expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
            expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
            expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(8);
            expect(mediaPlaylist['#EXT-X-MEDIA-SEQUENCE']).toBe(2680);
            expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeFalsy();
            expect(mediaPlaylist.size).toBe(3);
        });

        it('should parse a VOD Media Playlist', async (): Promise<void> => {
            const stream = loadTestFile(TestFiles.VOD_PLAYLIST);
            const mediaPlaylist = await MediaPlaylist.from(stream);

            expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
            expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
            expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(10);
            expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeTruthy();
            expect(mediaPlaylist.size).toBe(3);
        });

        it('should parse a Very Large Media Playlist', async (): Promise<void> => {
            const stream = loadTestFile(TestFiles.VERY_LARGE_PLAYLIST);
            const mediaPlaylist = await MediaPlaylist.from(stream);

            expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
            expect(mediaPlaylist['#EXT-X-VERSION']).toBe(4);
            expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(6);
            expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeTruthy();
            expect(mediaPlaylist.size).toBe(11701);
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
    });

    // describe('speed test', () => {
    //     let mine: MediaPlaylist;
    //     let theirs: any;
    //     it('should go fast', async (): Promise<void> => {
    //         HLS.setOptions({
    //             silent: false,
    //             strictMode: false,
    //         });
    //         //parse
    //         const theirsStart = Date.now();
    //         const inputStr = readFileSync('./examples/very-large-playlist.m3u8').toString();
    //         theirs = await HLS.parse(inputStr);
    //         const theirsEnd = Date.now();
    //         console.log('Theirs string took', theirsEnd - theirsStart, 'ms');

    //         // mine string
    //         const mineStringStart = Date.now();
    //         mine = await MediaPlaylist.from(inputStr);
    //         const mineStringEnd = Date.now();
    //         console.log('Mine string took', mineStringEnd - mineStringStart, 'ms');

    //         // mine stream
    //         // const start = Date.now();
    //         // const input = loadTestFile(TestFiles.VERY_LARGE_PLAYLIST);
    //         // mine = await MediaPlaylist.from(input);
    //         // const end = Date.now();
    //         // console.log('Mine stream took', end - start, 'ms');

    //         // //stringify
    //         // const startStringify = Date.now();
    //         // const mineString = mine.toHLS();
    //         // const endStringify = Date.now();
    //         // console.log('Mine stringify took', endStringify - startStringify, 'ms');

    //         // const theirsStartStringify = Date.now();
    //         // const theirsString = HLS.stringify(theirs);
    //         // const theirsEndStringify = Date.now();
    //         // console.log('Theirs stringify took', theirsEndStringify - theirsStartStringify, 'ms');

    //         // const mineLines = mineString.split('\n');
    //         // for (const [i, theirsLine] of theirsString.split('\n').entries()) {
    //         //     expect(mineLines[i]).toEqual(theirsLine);
    //         // }
    //     });
    // });
});
