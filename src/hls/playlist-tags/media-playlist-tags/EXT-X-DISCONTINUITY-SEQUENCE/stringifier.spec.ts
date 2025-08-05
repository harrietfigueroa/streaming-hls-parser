import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXDiscontinuitySequenceStringifier } from './stringifier';

describe('EXT-X-DISCONTINUITY-SEQUENCE stringifier', () => {
    it('should stringify with template literal using passed value', () => {
        const value = 8;
        const stringified = extXDiscontinuitySequenceStringifier(value);

        expect(stringified).toBe('#EXT-X-DISCONTINUITY-SEQUENCE:8');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify zero value', () => {
        const value = 0;
        const stringified = extXDiscontinuitySequenceStringifier(value);

        expect(stringified).toBe('#EXT-X-DISCONTINUITY-SEQUENCE:0');
        expectTypeOf(stringified).toBeString();
    });

    it('should stringify large number', () => {
        const value = 12345;
        const stringified = extXDiscontinuitySequenceStringifier(value);

        expect(stringified).toBe('#EXT-X-DISCONTINUITY-SEQUENCE:12345');
        expectTypeOf(stringified).toBeString();
    });

    it('should use the actual passed value', () => {
        const value = 999;
        const stringified = extXDiscontinuitySequenceStringifier(value);

        expect(stringified).toBe('#EXT-X-DISCONTINUITY-SEQUENCE:999');
        expectTypeOf(stringified).toBeString();
    });

    it('should have correct generic type inference', () => {
        const value = 42 as const;
        const stringified = extXDiscontinuitySequenceStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 