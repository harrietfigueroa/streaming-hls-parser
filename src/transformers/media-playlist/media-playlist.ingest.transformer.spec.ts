import { describe } from 'node:test';
import { MediaPlaylistIngestTransformer } from './media-playlist.ingest.transformer';
import { loadTestFile, TestFiles } from '../../../test/helpers/load-test-file';
import { HlsLexicalTransformer } from '../hls-lexical.transformer';
import { NewlineTransformer } from '../newline.transformer';

describe('Media Playlist Ingest Transformer', (): void => {
    describe('Live Playlist', () => {
        it('should parse a Media Playlist', async (): Promise<void> => {
            const readable = loadTestFile(TestFiles.LIVE_PLAYLIST)
                .pipe(new NewlineTransformer())
                .pipe(new HlsLexicalTransformer())
                .pipe(new MediaPlaylistIngestTransformer());

            for await (const token of readable) {
                expect(token).toHaveProperty('type');
                expect(token.source).toBeDefined();
            }
        });
    });

    describe('VOD Playlist', () => {
        it('should parse a Media Playlist', async (): Promise<void> => {
            const readable = loadTestFile(TestFiles.VOD_PLAYLIST)
                .pipe(new NewlineTransformer())
                .pipe(new HlsLexicalTransformer())
                .pipe(new MediaPlaylistIngestTransformer());

            for await (const token of readable) {
                expect(token).toHaveProperty('type');
                expect(token.source).toBeDefined();
            }
        });
    });
});
