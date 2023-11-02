import { describe } from 'node:test';
import { TestFiles, loadTestFile } from '../../test/helpers/load-test-file';
import { NewlineTransformer } from './newline-transformer';

describe('Newline Transformer', (): void => {
    let readable: NewlineTransformer;
    beforeEach(() => {
        readable = loadTestFile(TestFiles.LIVE_PLAYLIST).pipe(new NewlineTransformer());
    });

    it('should return an array of new lines from a test file', async (): Promise<void> => {
        for await (const line of readable) {
            // expect(typeof line).toBe('string');
        }
    });
});
