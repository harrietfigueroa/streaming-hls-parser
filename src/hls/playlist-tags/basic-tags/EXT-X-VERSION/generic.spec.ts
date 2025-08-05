import { describe, it, expect } from 'vitest';
import { extXVersionParser } from './parser';
import { extXVersionStringifier } from './stringifier';

describe('EXT-X-VERSION generic parser', () => {
    it('should demonstrate generic type inference', () => {
        const input = '#EXT-X-VERSION:5' as const;
        const result = extXVersionParser(input);
        expect(result).toBe(5);
        expect(typeof result).toBe('number');
    });

    it('should handle edge cases correctly', () => {
        const input = '#EXT-X-VERSION:0' as const;
        const result = extXVersionParser(input);
        expect(result).toBe(0);
        expect(typeof result).toBe('number');
    });

    it('should demonstrate conditional type behavior', () => {
        const validInput = '#EXT-X-VERSION:42' as const;
        const validResult = extXVersionParser(validInput);
        expect(validResult).toBe(42);

        const invalidInput = '#EXT-X-VERSION:abc' as const;
        const invalidResult = extXVersionParser(invalidInput);
        expect(invalidResult).toBeUndefined();
    });
});

describe('EXT-X-VERSION generic stringifier', () => {
    it('should have correct generic type inference', () => {
        const version = 5 as const;
        const result = extXVersionStringifier(version);
        expect(result).toBe('#EXT-X-VERSION:5');
        expect(typeof result).toBe('string');
    });

    it('should work with different number types', () => {
        const version1 = 1 as const;
        const version2 = 999 as const;

        expect(extXVersionStringifier(version1)).toBe('#EXT-X-VERSION:1');
        expect(extXVersionStringifier(version2)).toBe('#EXT-X-VERSION:999');
    });

    it('should preserve literal types', () => {
        const version = 42 as const;
        const result = extXVersionStringifier(version);
        expect(result).toBe('#EXT-X-VERSION:42');
    });
}); 