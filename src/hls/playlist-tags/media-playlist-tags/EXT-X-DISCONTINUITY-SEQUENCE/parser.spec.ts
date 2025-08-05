import { describe, it, expect } from 'vitest';
import { extXDiscontinuitySequenceParser } from './parser';

describe('extXDiscontinuitySequenceParser', () => {
    it('should parse valid decimal integers', () => {
        const result1 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:0');
        expect(result1).toBe(0);

        const result2 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:42');
        expect(result2).toBe(42);

        const result3 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:4294967295');
        expect(result3).toBe(4294967295);
    });

    it('should return parsed values for all numeric inputs', () => {
        const result1 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:-1');
        expect(result1).toBe(-1);

        const result2 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:1.5');
        expect(result2).toBe(1);

        const result3 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:4294967296');
        expect(result3).toBe(4294967296);
    });

    it('should return undefined for non-numeric inputs', () => {
        const result1 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:abc');
        expect(result1).toBeUndefined();

        const result2 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:');
        expect(result2).toBeUndefined();
    });

    it('should have correct return types based on input', () => {
        // These should compile with correct types
        const valid1 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:0');
        // Type should be: 0

        const valid2 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:42');
        // Type should be: 42

        const invalid1 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:-1');
        // Type should be: -1

        const invalid2 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:abc');
        // Type should be: undefined

        // This demonstrates that the types are correctly inferred
        expect(typeof valid1).toBe('number');
        expect(typeof valid2).toBe('number');
        expect(typeof invalid1).toBe('number');
        expect(valid1).toBe(0);
        expect(valid2).toBe(42);
        expect(invalid1).toBe(-1);
    });
});
