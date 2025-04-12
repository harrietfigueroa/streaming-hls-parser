import { describe, expect, it } from 'vitest';
import mediaSequenceParser from './parser';
describe('EXT-X-MEDIA-SEQUENCE', () => {
    it('should parse the tag', () => {
        const test = '#EXT-X-MEDIA-SEQUENCE:2680';
        const parsed = mediaSequenceParser(test);

        expect(parsed).toBe(2680);
    });
});
