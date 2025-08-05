import { describe, it, expect } from 'vitest';
import { extXDiscontinuityStringifier } from './stringifier';
import { EXT_X_DISCONTINUITY_STRING } from './types';

describe('EXT-X-DISCONTINUITY stringifier', () => {
    it('should stringify to correct format', () => {
        const result = extXDiscontinuityStringifier();
        expect(result).toBe('#EXT-X-DISCONTINUITY\n');
    });

    it('should have correct return type', () => {
        const result = extXDiscontinuityStringifier();
        const _test: EXT_X_DISCONTINUITY_STRING = result;
        expect(typeof result).toBe('string');
    });

    it('should return the exact expected string', () => {
        const result = extXDiscontinuityStringifier();
        expect(result).toBe('#EXT-X-DISCONTINUITY\n');
    });
}); 