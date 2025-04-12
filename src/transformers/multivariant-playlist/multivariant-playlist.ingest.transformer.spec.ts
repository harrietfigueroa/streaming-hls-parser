import { describe, expect, it } from 'vitest';
import { loadTestFile, TestFiles } from '../../../test/helpers/load-test-file';
import { HlsLexicalTransformer } from '../hls-lexical.transformer';
import { NewlineTransformer } from '../newline.transformer';
import { MultivariantPlaylistIngestTransformer } from './multivariant-playlist.ingest.transformer';

describe('Multivariant Ingest Transformer', (): void => {
    it('should parse a Multivariant Playlist', async (): Promise<void> => {
        const readable = loadTestFile(TestFiles.MULTI_VARIANT_PLAYLIST)
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer())
            .pipe(new MultivariantPlaylistIngestTransformer());

        for await (const token of readable) {
            expect(token).toHaveProperty('type');
            expect(token.source).toBeDefined();
        }
    });
});
