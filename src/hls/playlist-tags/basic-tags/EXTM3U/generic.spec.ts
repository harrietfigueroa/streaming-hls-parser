import { describe, it, expect } from 'vitest';
import { extM3uParser } from './parser';
import { extM3uStringifier } from './stringifier';

describe('EXTM3U generic parser', () => {
    it('should demonstrate generic type inference', () => {
        const input = '#EXTM3U' as const;
        const result = extM3uParser(input);
        expect(result).toBe(true);
        expect(typeof result).toBe('boolean');
    });

    it('should handle edge cases correctly', () => {
        const input = undefined;
        const result = extM3uParser(input);
        expect(result).toBe(false);
        expect(typeof result).toBe('boolean');
    });

    it('should demonstrate conditional type behavior', () => {
        const validInput = '#EXTM3U' as const;
        const validResult = extM3uParser(validInput);
        expect(validResult).toBe(true);

        const invalidInput = '' as const;
        const invalidResult = extM3uParser(invalidInput);
        expect(invalidResult).toBe(false);
    });
});

describe('EXTM3U generic stringifier', () => {
    it('should have correct generic type inference', () => {
        const result = extM3uStringifier();
        expect(result).toBe('#EXTM3U');
        expect(typeof result).toBe('string');
    });

    it('should always return the same value', () => {
        const result1 = extM3uStringifier();
        const result2 = extM3uStringifier();
        expect(result1).toBe(result2);
        expect(result1).toBe('#EXTM3U');
    });

    it('should preserve literal types', () => {
        const result = extM3uStringifier();
        expect(result).toBe('#EXTM3U');
    });
}); 