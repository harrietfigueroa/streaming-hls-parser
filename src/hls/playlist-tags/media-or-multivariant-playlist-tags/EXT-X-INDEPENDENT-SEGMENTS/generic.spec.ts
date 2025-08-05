import { describe, it, expect } from 'vitest';
import { extXIndependentSegmentsParser } from './parser';
import { extXIndependentSegmentsStringifier } from './stringifier';

describe('EXT-X-INDEPENDENT-SEGMENTS generic parser', () => {
    it('should demonstrate generic type inference', () => {
        const input = '#EXT-X-INDEPENDENT-SEGMENTS' as const;
        const result = extXIndependentSegmentsParser(input);
        expect(result).toBe(true);
        expect(typeof result).toBe('boolean');
    });

    it('should handle edge cases correctly', () => {
        const input = undefined;
        const result = extXIndependentSegmentsParser(input);
        expect(result).toBe(false);
        expect(typeof result).toBe('boolean');
    });

    it('should demonstrate conditional type behavior', () => {
        const validInput = '#EXT-X-INDEPENDENT-SEGMENTS' as const;
        const validResult = extXIndependentSegmentsParser(validInput);
        expect(validResult).toBe(true);

        const invalidInput = '' as const;
        const invalidResult = extXIndependentSegmentsParser(invalidInput);
        expect(invalidResult).toBe(false);
    });
});

describe('EXT-X-INDEPENDENT-SEGMENTS generic stringifier', () => {
    it('should have correct generic type inference', () => {
        const result = extXIndependentSegmentsStringifier();
        expect(result).toBe('#EXT-X-INDEPENDENT-SEGMENTS');
        expect(typeof result).toBe('string');
    });

    it('should always return the same value', () => {
        const result1 = extXIndependentSegmentsStringifier();
        const result2 = extXIndependentSegmentsStringifier();
        expect(result1).toBe(result2);
        expect(result1).toBe('#EXT-X-INDEPENDENT-SEGMENTS');
    });

    it('should preserve literal types', () => {
        const result = extXIndependentSegmentsStringifier();
        expect(result).toBe('#EXT-X-INDEPENDENT-SEGMENTS');
    });
}); 