import { describe, expect, it, expectTypeOf } from 'vitest';
import { extXByteRangeStringifier } from './stringifier';

describe('EXT-X-BYTERANGE generic stringifier', () => {
    it('should have correct generic type inference', () => {
        const value = { LENGTH: 1024 } as const;
        const stringified = extXByteRangeStringifier(value);

        // TypeScript should infer the exact type
        expect(stringified).toBe('#EXT-X-BYTERANGE:1024');
        expect(typeof stringified).toBe('string');
        expectTypeOf(stringified).toBeString();
    });

    it('should work with different length values', () => {
        const value1 = { LENGTH: 1024 };
        const stringified1 = extXByteRangeStringifier(value1);
        expect(stringified1).toBe('#EXT-X-BYTERANGE:1024');
        expectTypeOf(stringified1).toBeString();

        const value2 = { LENGTH: 1048576 };
        const stringified2 = extXByteRangeStringifier(value2);
        expect(stringified2).toBe('#EXT-X-BYTERANGE:1048576');
        expectTypeOf(stringified2).toBeString();
    });

    it('should work with length and offset', () => {
        const value = { LENGTH: 1024, OFFSET: 2048 };
        const stringified = extXByteRangeStringifier(value);
        expect(stringified).toBe('#EXT-X-BYTERANGE:1024@2048');
        expectTypeOf(stringified).toBeString();
    });

    it('should work with zero values', () => {
        const value = { LENGTH: 0, OFFSET: 0 };
        const stringified = extXByteRangeStringifier(value);
        expect(stringified).toBe('#EXT-X-BYTERANGE:0@0');
        expectTypeOf(stringified).toBeString();
    });

    it('should preserve literal types', () => {
        const value = { LENGTH: 1024, OFFSET: 2048 } as const;
        const stringified = extXByteRangeStringifier(value);

        expectTypeOf(stringified).toBeString();
        expectTypeOf(stringified).not.toBeNumber();
        expectTypeOf(stringified).not.toBeBoolean();
    });
}); 