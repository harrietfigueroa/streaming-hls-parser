import { TestFiles, loadTestFile } from '../../test/helpers/load-test-file';
import { NewlineTransformer } from './newline.transformer';
import { HlsLexicalTransformer } from './hls-lexical.transformer';
import { beforeEach, describe, expect, it } from 'vitest';

describe('HLS Lexical Transformer', (): void => {
    let readable: HlsLexicalTransformer;
    beforeEach(() => {
        readable = loadTestFile(TestFiles.LIVE_PLAYLIST)
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer());
    });
    it('should parse stuff', async (): Promise<void> => {
        const readable = loadTestFile(TestFiles.LIVE_PLAYLIST)
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer());

        for await (const line of readable) {
            expect(line).toHaveProperty('type');
            expect(line.type).toBeDefined();
            expect(line.source).toBeDefined();
        }
    });
});
