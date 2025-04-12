import { describe, expect, it } from 'vitest';
import targetDurationParser from './parser';

describe('EXT-X-TARGETDURATION', () => {
    it('should parse the tag', () => {
        const test = '#EXT-X-TARGETDURATION:8';
        const parsed: number = targetDurationParser(test);

        expect(parsed).toEqual(8);
    });
});
