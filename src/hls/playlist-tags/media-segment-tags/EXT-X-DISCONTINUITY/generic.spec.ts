import { describe, it, expect } from 'vitest';
import { extXDiscontinuityParser } from './parser';
import { extXDiscontinuityStringifier } from './stringifier';
import { EXT_X_DISCONTINUITY_PARSED, EXT_X_DISCONTINUITY_STRING } from './types';

describe('EXT-X-DISCONTINUITY generic type inference', () => {
    it('should have correct generic type inference for parser', () => {
        const result = extXDiscontinuityParser('#EXT-X-DISCONTINUITY');

        // Type assertion to test generic inference
        const _test: EXT_X_DISCONTINUITY_PARSED = result;

        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
    });

    it('should have correct generic type inference for stringifier', () => {
        const result = extXDiscontinuityStringifier();

        // Type assertion to test generic inference
        const _test: EXT_X_DISCONTINUITY_STRING = result;

        expect(typeof result).toBe('string');
        expect(result).toBe('#EXT-X-DISCONTINUITY\n');
    });

    it('should maintain type safety across parser and stringifier', () => {
        const parsed = extXDiscontinuityParser('#EXT-X-DISCONTINUITY');
        const stringified = extXDiscontinuityStringifier();

        // Type assertions to ensure type safety
        const _testParsed: EXT_X_DISCONTINUITY_PARSED = parsed;
        const _testStringified: EXT_X_DISCONTINUITY_STRING = stringified;

        expect(typeof parsed).toBe('boolean');
        expect(typeof stringified).toBe('string');
    });

    it('should handle parser with different input types', () => {
        const result1 = extXDiscontinuityParser('#EXT-X-DISCONTINUITY');
        const result2 = extXDiscontinuityParser(undefined);
        const result3 = extXDiscontinuityParser('');

        // All should return the same type
        const _test1: EXT_X_DISCONTINUITY_PARSED = result1;
        const _test2: EXT_X_DISCONTINUITY_PARSED = result2;
        const _test3: EXT_X_DISCONTINUITY_PARSED = result3;

        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);
    });
}); 