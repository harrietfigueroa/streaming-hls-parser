import { describe, it, expect } from 'vitest';
import { extXDiscontinuitySequenceParser } from './parser';

describe('EXT-X-DISCONTINUITY-SEQUENCE Generic Parser', () => {
    it('should demonstrate generic type inference', () => {
        // Valid inputs - should return specific number types
        const valid1 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:0');
        const valid2 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:42');
        const valid3 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:999');

        // Invalid inputs - should return parsed values or undefined
        const invalid1 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:-1');
        const invalid2 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:abc');
        const invalid3 = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:1.5');

        // Runtime checks
        expect(valid1).toBe(0);
        expect(valid2).toBe(42);
        expect(valid3).toBe(999);
        expect(invalid1).toBe(-1);
        expect(invalid2).toBeUndefined();
        expect(invalid3).toBe(1);

        // Type checks - these should compile correctly
        expect(typeof valid1).toBe('number');
        expect(typeof valid2).toBe('number');
        expect(typeof valid3).toBe('number');
        expect(typeof invalid1).toBe('number');
    });

    it('should handle edge cases correctly', () => {
        // Maximum valid value
        const maxValid = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:4294967295');
        expect(maxValid).toBe(4294967295);

        // Value exceeding maximum
        const tooLarge = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:4294967296');
        expect(tooLarge).toBe(4294967296);

        // Empty value
        const empty = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:');
        expect(empty).toBeUndefined();
    });

    it('should demonstrate conditional type behavior', () => {
        // These demonstrate how the conditional types work
        // Valid inputs return their specific number literal types
        const zero = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:0');
        // Type should be: 0

        const fortyTwo = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:42');
        // Type should be: 42

        const large = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:999');
        // Type should be: 999

        // Invalid inputs return parsed values or undefined
        const negative = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:-1');
        // Type should be: -1

        const nonNumeric = extXDiscontinuitySequenceParser('#EXT-X-DISCONTINUITY-SEQUENCE:abc');
        // Type should be: undefined

        // Runtime verification
        expect(zero).toBe(0);
        expect(fortyTwo).toBe(42);
        expect(large).toBe(999);
        expect(negative).toBe(-1);
        expect(nonNumeric).toBeUndefined();
    });
}); 