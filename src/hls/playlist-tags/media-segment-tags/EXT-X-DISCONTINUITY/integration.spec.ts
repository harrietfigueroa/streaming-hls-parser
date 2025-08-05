import { describe, it, expect } from 'vitest';
import { extXDiscontinuityParser } from './parser';
import { extXDiscontinuityStringifier } from './stringifier';

describe('EXT-X-DISCONTINUITY integration', () => {
    it('should parse and stringify round-trip correctly', () => {
        // Parse the tag
        const parsed = extXDiscontinuityParser('#EXT-X-DISCONTINUITY');
        expect(parsed).toBe(true);

        // Stringify the parsed result
        const stringified = extXDiscontinuityStringifier();
        expect(stringified).toBe('#EXT-X-DISCONTINUITY\n');

        // Verify the stringified result matches the expected format
        expect(stringified).toMatch(/^#EXT-X-DISCONTINUITY\n$/);
    });

    it('should maintain type safety through round-trip', () => {
        const parsed = extXDiscontinuityParser('#EXT-X-DISCONTINUITY');
        const stringified = extXDiscontinuityStringifier();

        // Type assertions to ensure type safety
        const _testParsed: boolean = parsed;
        const _testStringified: string = stringified;

        expect(typeof parsed).toBe('boolean');
        expect(typeof stringified).toBe('string');
    });

    it('should handle parser with undefined input', () => {
        const parsed = extXDiscontinuityParser(undefined);
        expect(parsed).toBe(true);

        const stringified = extXDiscontinuityStringifier();
        expect(stringified).toBe('#EXT-X-DISCONTINUITY\n');
    });
}); 