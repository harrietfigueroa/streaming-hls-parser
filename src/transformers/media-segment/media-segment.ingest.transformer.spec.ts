import { describe } from 'node:test';
import { loadTestFile, TestFiles } from '../../../test/helpers/load-test-file';
import { HlsLexicalTransformer } from '../hls-lexical.transformer';
import { NewlineTransformer } from '../newline.transformer';
import { MediaPlaylistIngestTransformer } from '../media-playlist/media-playlist.ingest.transformer';
import { MediaSegmentIngestTransformer } from './media-segment.ingest.transformer';

describe('Media Segment Ingest Transformer', (): void => {
    describe('Live Playlist', () => {
        it('should parse segments from a Media Playlist', async (): Promise<void> => {
            const readable = loadTestFile(TestFiles.LIVE_PLAYLIST)
                .pipe(new NewlineTransformer())
                .pipe(new HlsLexicalTransformer())
                .pipe(new MediaPlaylistIngestTransformer())
                .pipe(new MediaSegmentIngestTransformer());

            for await (const token of readable) {
                expect(token).toHaveProperty('type');
                expect(token.source).toBeDefined();
            }
        });
    });

    describe('VOD Playlist', () => {
        it('should parse segments from a Media Playlist', async (): Promise<void> => {
            const readable = loadTestFile(TestFiles.VOD_PLAYLIST)
                .pipe(new NewlineTransformer())
                .pipe(new HlsLexicalTransformer())
                .pipe(new MediaPlaylistIngestTransformer())
                .pipe(new MediaSegmentIngestTransformer());

            for await (const token of readable) {
                expect(token).toHaveProperty('type');
                expect(token.source).toBeDefined();
            }
        });
    });
});
