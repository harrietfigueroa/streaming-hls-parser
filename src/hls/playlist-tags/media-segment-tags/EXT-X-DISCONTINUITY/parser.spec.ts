import { describe, it, expect } from 'vitest';
import { extXDiscontinuityParser } from './parser';
import { EXT_X_DISCONTINUITY_PARSED } from './types';

describe('EXT-X-DISCONTINUITY parser', () => {
    it('should parse valid EXT-X-DISCONTINUITY tag', () => {
        const result = extXDiscontinuityParser('#EXT-X-DISCONTINUITY');
        expect(result).toBe(true);
    });

    it('should parse undefined input', () => {
        const result = extXDiscontinuityParser(undefined);
        expect(result).toBe(true);
    });

    it('should parse empty string', () => {
        const result = extXDiscontinuityParser('');
        expect(result).toBe(true);
    });

    it('should parse any string input', () => {
        const result = extXDiscontinuityParser('any string');
        expect(result).toBe(true);
    });

    it('should have correct return type', () => {
        const result = extXDiscontinuityParser('#EXT-X-DISCONTINUITY');
        const _test: EXT_X_DISCONTINUITY_PARSED = result;
        expect(typeof result).toBe('boolean');
    });
}); 