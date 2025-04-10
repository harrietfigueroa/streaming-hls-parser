import { describe } from 'node:test';
import { loadTestFile, TestFiles } from '../../../test/helpers/load-test-file';
import { MediaPlaylist } from './media-playlist';

describe('Media Playlist', (): void => {
    describe('Live Playlist', () => {
        it('should parse a Media Playlist', async (): Promise<void> => {
            const stream = loadTestFile(TestFiles.LIVE_PLAYLIST);
            const mediaPlaylist = await MediaPlaylist.fromStream(stream);

            console.dir(mediaPlaylist);
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
            const mediaPlaylist = await MediaPlaylist.fromStream(stream);

            console.dir(mediaPlaylist);
            expect(mediaPlaylist).toBeInstanceOf(MediaPlaylist);
            expect(mediaPlaylist['#EXT-X-VERSION']).toBe(3);
            expect(mediaPlaylist['#EXT-X-TARGETDURATION']).toBe(10);
            expect(mediaPlaylist['#EXT-X-ENDLIST']).toBeTruthy();
        });
    });
});
