import { describe } from 'node:test';
import { TestFiles, loadTestFile } from '../../test/helpers/load-test-file';
import { NewlineTransformer } from './newline.transformer';
import { HlsLexicalTransformer } from './hls-lexical.transformer';
import { MediaPlaylistTransformer } from './media-playlist.transformer';

describe('MediaPlaylist Transformer', (): void => {
    let readable: HlsLexicalTransformer;
    beforeEach(() => {
        readable = loadTestFile(TestFiles.LIVE_PLAYLIST)
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer());
    });
    it('should parse a Media Playlist', async (): Promise<void> => {
        const readable = loadTestFile(TestFiles.LIVE_PLAYLIST)
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer())
            .pipe(new MediaPlaylistTransformer());

        for await (const token of readable) {
            console.dir(token);
            expect(token).toHaveProperty('type');
            // expect(line.type).toBeDefined();
            // expect(line.value).toBeDefined();
        }
    });
});
