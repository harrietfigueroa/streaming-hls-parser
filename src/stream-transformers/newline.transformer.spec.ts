import { describe, expect, it } from 'vitest';
import { TestFiles, loadTestFile } from '../../test/helpers/load-test-file';
import { NewlineTransformer } from './newline.transformer';

describe('Newline Transformer', (): void => {
    it.each([
        [TestFiles.LIVE_PLAYLIST],
        [TestFiles.VERY_LARGE_PLAYLIST],
        [TestFiles.VOD_PLAYLIST],
        [TestFiles.MULTI_VARIANT_PLAYLIST],
    ])('should return an array of lines from the test file: %s', async (file: TestFiles) => {
        const readable = loadTestFile(file).pipe(new NewlineTransformer());
        for await (const line of readable) {
            expect(typeof line).toBe('string');
        }
    });

    it.each([
        [TestFiles.LIVE_PLAYLIST],
        [TestFiles.VERY_LARGE_PLAYLIST],
        [TestFiles.VOD_PLAYLIST],
        [TestFiles.MULTI_VARIANT_PLAYLIST],
    ])('should read from a string', async (file: TestFiles) => {
        const readable = await loadTestFile(file);
        const playlisr = (await readable.toArray()).join('\n');
        expect(playlisr).toBeDefined();
    });
});
