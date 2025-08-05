import { describe, it, expect } from 'vitest';
import { extXIndependentSegmentsStringifier } from './stringifier';

describe('EXT-X-INDEPENDENT-SEGMENTS stringifier', () => {
    it('should stringify with template literal', () => {
        const result = extXIndependentSegmentsStringifier();
        expect(result).toBe('#EXT-X-INDEPENDENT-SEGMENTS');
    });

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
}); 